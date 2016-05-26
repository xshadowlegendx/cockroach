// source: models/metrics.ts
/// <reference path="proto.ts" />
/// <reference path="../../bower_components/mithriljs/mithril.d.ts" />
/// <reference path="../util/chainprop.ts" />
/// <reference path="../util/convert.ts" />
/// <reference path="../util/http.ts" />
/// <reference path="../util/querycache.ts" />
/// <reference path="../models/timescale.ts" />
/// <reference path="../util/types.ts" />

// Author: Matt Tracy (matt@cockroachlabs.com)

/**
 * Models contains data models pulled from cockroach.
 */
module Models {
  "use strict";
  /**
   * Metrics package represents the internal performance metrics collected by
   * cockroach.
   */
  export module Metrics {
    import promise = _mithril.MithrilPromise;

    /**
     * QueryInfo is an interface that is implemented by both Proto.QueryResult and
     * Proto.QueryRequest. A QueryInfo object references a unique dataset
     * that can be returned from the server.
     */
    interface QueryInfo {
      name: string;
      downsampler: Proto.QueryAggregator;
      source_aggregator: Proto.QueryAggregator;
      derivative: Proto.QueryDerivative;
    }

    /**
     * QueryInfoKey returns a string key that uniquely identifies the
     * server-side dataset referenced by the QueryInfo.
     */
    export function QueryInfoKey(qi: QueryInfo): string {
      return [
        Proto.QueryAggregator[qi.downsampler],
        Proto.QueryAggregator[qi.source_aggregator],
        Proto.QueryDerivative[qi.derivative],
        qi.name,
      ].join(":");
    }

    /**
     * QueryInfoSet is a generic set structure which contains at most one
     * QueryInfo object for each possible key. They key for a QueryInfo
     * object should be generated with the QueryInfoKey() method.
     */
    export class QueryInfoSet<T extends QueryInfo> {
      private _set: { [key: string]: T } = {};

      /**
       * add adds an object of type T to this set. The supplied T is
       * uniquely identified by the output of QueryKey(). If the set
       * already contains an entry with the same QueryKey, it is
       * overwritten.
       */
      add(qi: T): void {
        let key: string = QueryInfoKey(qi);
        this._set[key] = qi;
      }

      /**
       * get returns the object in the set which has the given key.
       */
      get(key: string): T {
        return this._set[key];
      }

      /**
       * forEach invokes the supplied function for each member of the set.
       */
      forEach(fn: (element: T) => void): void {
        let keys: string[] = Object.keys(this._set);
        for (let i: number = 0; i < keys.length; i++) {
          fn(this._set[keys[i]]);
        }
      }
    }

    /**
     * QueryResultSet is a set structure that contains at most one
     * QueryResult object for each possible key. The key for each
     * QueryResult is generated by the QueryInfoKey() method.
     */
    export type QueryResultSet = QueryInfoSet<Proto.QueryResult>;

    /**
     * QueryRequestSet is a set structure that contains at most one
     * QueryRequest object for each possible key. The key for each
     * QueryRequest is generated by the QueryInfoKey() method.
     */
    export type QueryRequestSet = QueryInfoSet<Proto.QueryRequest>;

    /**
     * Select contains time series selectors for use in metrics queries.
     * Each selector defines a dataset on the server which should be
     * queried, along with additional information about how to process the
     * data (e.g. aggregation functions, transformations) and how it should
     * be displayed (e.g. a friendly title for graph legends).
     */
    export module Select {

      /**
       * Selector is a class which describes a time series request. It describes
       * the name of a series, along with a set of functions that will be used
       * to process the data from the series: a downsampler, an aggregator and a
       * derivative function.
       */
      export class Selector {
        /**
         * Construct a new selector which requests data for the given time
         * series, downsampling data using the provided aggregator.
         */
        constructor(private seriesName: string, private downsampler: Proto.QueryAggregator) {}
        /**
         * sources returns the data sources to which this query is restrained.
         */
        sources: Utils.ChainProperty<string[], Selector> = Utils.ChainProp(this, []);
        /**
         * title returns a display-friendly title for this series.
         */
        title: Utils.ChainProperty<string, Selector> = Utils.ChainProp(this, this.seriesName);
        /**
         * aggregator sets the source aggregator to be used for this query.
         */
        aggregator: Utils.ChainProperty<Proto.QueryAggregator, Selector> =
          Utils.ChainProp( this, Proto.QueryAggregator.SUM);
        /**
         * derivative sets the derivative function to be applied to the results
         * of this query.
         */
        derivative: Utils.ChainProperty<Proto.QueryDerivative, Selector> =
          Utils.ChainProp( this, Proto.QueryDerivative.NONE);
        /**
         * series returns the series that is being queried.
         */
        series: () => string = () => { return this.seriesName; };
        /**
         * rate is a convenience method to set the derivative function to
         * 'Derivative'
         */
        rate: () => Selector = () => {
          return this.derivative(Proto.QueryDerivative.DERIVATIVE);
        };
        /**
         * nonNegativeRate is a convenience method to set the derivative function to
         * 'Non_Negative_Derivative'
         */
        nonNegativeRate: () => Selector = () => {
          return this.derivative(Proto.QueryDerivative.NON_NEGATIVE_DERIVATIVE);
        };
        /**
         * max is a convenience method to set the aggregator function to
         * 'Maximum'
         */
        maxAggregator: () => Selector = () => {
          return this.aggregator(Proto.QueryAggregator.MAX);
        };
        /**
         * min is a convenience method to set the aggregator function to
         * 'Minimum'
         */
        minAggregator: () => Selector = () => {
          return this.aggregator(Proto.QueryAggregator.MIN);
        };
        /**
         * request returns a QueryRequest object based on this selector.
         */
        request: () => Proto.QueryRequest = (): Proto.QueryRequest => {
          return {
            name: this.seriesName,
            sources: this.sources(),
            downsampler: this.downsampler,
            source_aggregator: this.aggregator(),
            derivative: this.derivative(),
          };
        };
      }

      /**
       * Avg instantiates a new selector for the supplied time series which
       * downsamples by averaging.
       */
      export function Avg(series: string): Selector {
        return new Selector(series, Proto.QueryAggregator.AVG);
      }

      /**
       * Max instantiates a new selector for the supplied time series which
       * downsamples the timeseries by taking the maximum value.
       */
      export function Max(series: string): Selector {
        return new Selector(series, Proto.QueryAggregator.MAX);
      }

      /**
       * Min instantiates a new selector for the supplied time series which
       * downsamples the timeseries by taking the minimum value.
       */
      export function Min(series: string): Selector {
        return new Selector(series, Proto.QueryAggregator.MIN);
      }
    }

    /**
     * time contains available time span specifiers for metrics queries.
     */
    export module Time {
      /**
       * TimeSpan is the interface implemeted by time span specifiers.
       */
      export interface TimeSpan {
        /**
         * timespan returns a two-value number array which defines the
         * time range of a query. The first value is a timestamp for the
         * start of the range, the second value a timestamp for the end
         * of the range.
         */
        timespan(): number[];
      }

      /**
       * Recent selects a duration of constant size extending backwards
       * from the current time. The current time is recomputed each time
       * Recent's timespan() method is called.
       */
      export function Recent(duration: number): TimeSpan {
        return {
          timespan: function(): number[] {
            let endTime: Date = new Date();
            let startTime: Date = new Date(endTime.getTime() - duration);
            return [startTime.getTime(), endTime.getTime()];
          },
        };
      }

      /**
       * Recent selects a duration of constant size extending backwards
       * from the current time. The current time is recomputed each time
       * Recent's timespan() method is called.
       */
      export function GlobalTimeSpan(): TimeSpan {
        return {
          timespan: function(): number[] {
            let duration: number = Models.Timescale.getCurrentTimescale();
            let endTime: Date = new Date();
            let startTime: Date = new Date(endTime.getTime() - duration);
            return [startTime.getTime(), endTime.getTime()];
          },
        };
      }
    }

    /**
     * An Axis is a collection of selectors which are expressed in the same
     * units. Data from the selectors can be displayed together on the same
     * chart with a shared domain.
     */
    export class Axis {
      /**
       * label is a string value which labels the axis. This should
       * describe the units for values on the axis.
       */
      label: Utils.ChainProperty<string, Axis> = Utils.ChainProp(this, null);

      /**
       * format is a function which formats numerical values on the axis
       * for display.
       */
      format: Utils.ChainProperty<(n: number) => string, Axis> = Utils.ChainProp(this, null);

      /**
       * selectors is an array of selectors which should be displayed on this
       * axis.
       */
      selectors: Utils.ChainProperty<Select.Selector[], Axis> = Utils.ChainProp(this, []);

      /**
       * range lets you set the y-axis range. It behaves slightly differently depending on whether the graph
       * is stacked or not:
       *  - if the graph is stacked, it sets the y-axis range exactly (using nvd3's yDomain)
       *  - if the graph is not stacked, it requires that all numbers in the range array appear in the y axis
       *    but will also expand beyond the given values (using nvd3's forceY)
       */
      range: Utils.ChainProperty<number[], Axis> = Utils.ChainProp(this, null);

      /**
       *  stacked is a boolean that indicates whether the chart is a stacked area chart (true)
       *  or a normal line chart (false)
       */
      stacked: Utils.ChainProperty<boolean, Axis> = Utils.ChainProp(this, false);

      /**
       *  legend forces the legend to be hidden (false) or visible (true)
       */
      legend: Utils.ChainProperty<boolean, Axis> = Utils.ChainProp(this, null);

      /**
       *  xAxis forces the xAxis to be hidden (false) or visible (true)
       */
      xAxis: Utils.ChainProperty<boolean, Axis> = Utils.ChainProp(this, true);

      /**
       *  yLow forces the the yAxis to extend down to the specified value, even if the min data value is higher
       *  The default is 0 but to disable the behavior yLow can be set to null
       */
      yLow: Utils.ChainProperty<number, Axis> = Utils.ChainProp(this, 0);

      /**
       *  yHigh forces the yaxis to extend up to the specified value, even if the max data value is lower
       *  The default is 1 but to disable the behavior yHigh can be set to null
       */
      yHigh: Utils.ChainProperty<number, Axis> = Utils.ChainProp(this, 1);

      /**
       *  tooltip is the informational tooltip for the chart
       */
      tooltip: Utils.ChainProperty<string, Axis> = Utils.ChainProp(this, null);

      // Stores the hard-coded title if one is set.
      private _title: MithrilChild;

      /**
       * title returns an appropriate title for a chart displaying this
       * axis. This is generated by combining the titles of all selectors
       * on the axis.
       */
      title(): MithrilChild;
      title(t: string): Axis;

      // TODO: allow computed chain props and move this code there
      title(t?: MithrilChild): (Axis|MithrilChild) {
        if (t) {
          this._title = t;
          return this;
        } else {
          let selectors: Select.Selector[] = this.selectors();
          let customTitle: MithrilChild = this._title;
          if (selectors.length === 0) {
            return "No series selected.";
          }
          return customTitle || selectors.map((s: Select.Selector) => s.title()).join(" vs. ");
        }
      }
    }

    /**
     * NewAxis constructs a new axis object which displays information from
     * the supplied selectors. Additional properties of the query can be
     * configured by calling setter methods on the returned Axis.
     */
    export function NewAxis(...selectors: Select.Selector[]): Axis {
      return new Axis().selectors(selectors);
    }

    /**
     * Query describes a single, repeatable query for time series data. Each
     * query contains one or more time series selectors, and a time span
     * over which to query those selectors.
     */
    export class Query {
      /**
       * timespan gets or sets the TimeSpan over which data should be
       * queried. By default, the query will return the last ten minutes
       * of data.
       */
      timespan: Utils.ChainProperty<Time.TimeSpan, Query> = Utils.ChainProp(this, Time.Recent(10 * 60 * 1000));

      /**
       * title gets or sets the title of this query, which can be applied
       * to visualizations of the data from this query.
       */
      title: Utils.ChainProperty<string, Query> = Utils.ChainProp(this, "Query Title");

      /**
       * selectors is a set of selectors which should be displayed on this
       * axis.
       */
      selectors: Utils.ChainProperty<Select.Selector[], Query> = Utils.ChainProp(this, []);

      private static dispatch_query(q: Proto.QueryRequestSet): promise<QueryResultSet> {
          // HACK: Convert long to string.
          let anyq: any = q;
          anyq.end_nanos = q.end_nanos.toString();
          anyq.start_nanos = q.start_nanos.toString();

          return Utils.Http.Post("/ts/query", anyq)
              .then((d: Proto.Results) => {
                  // Populate missing collection fields with empty arrays.
                  if (!d.results) {
                      d.results = [];
                  }
                  let result: QueryInfoSet<Proto.QueryResult> = new QueryInfoSet<Proto.QueryResult>();
                  d.results.forEach((r: Proto.Result) => {
                      result.add({
                        name: r.query.name,
                        // HACK: convert enum string to constant number.
                        downsampler: Proto.QueryAggregator[r.query.downsampler] as any,
                        source_aggregator: Proto.QueryAggregator[r.query.source_aggregator] as any,
                        derivative: Proto.QueryDerivative[r.query.derivative] as any,
                        datapoints: r.datapoints || [],
                      });
                  });
                  return result;
              });
      }

      /**
       * execute dispatches a query to the server and returns a promise
       * for the results.
       */
      execute: () => promise<QueryResultSet> = (): promise<QueryResultSet> => {
        let ts: number[] = this.timespan().timespan();
        let req: Proto.QueryRequestSet = {
          start_nanos: Long.fromNumber(Utils.Convert.MilliToNano(ts[0])),
          end_nanos: Long.fromNumber(Utils.Convert.MilliToNano(ts[1])),
          queries: [],
        };

        // Build a set of requests by looping over selectors. The set of
        // requests will be de-duplicated.
        let requestSet: QueryInfoSet<Proto.QueryRequest> = new QueryInfoSet<Proto.QueryRequest>();
        this.selectors().forEach((s: Select.Selector) => {
          requestSet.add(s.request());
        });
        requestSet.forEach((qr: Proto.QueryRequest) => {
          req.queries.push(qr);
        });

        return Query.dispatch_query(req);
      };
    }

    /**
     * NewQuery constructs a new query object which queries the supplied
     * selectors. Additional properties of the query can be configured by
     * calling setter methods on the returned Query.
     */
    export function NewQuery(...selectors: Select.Selector[]): Query {
      return new Query().selectors(selectors);
    }

    /**
     * Executor is a convenience class for persisting the results of a query
     * execution.
     */
    export class Executor extends Utils.QueryCache<QueryResultSet> {
      private _metricquery: Query;

      query: () => Query = () => {
        return this._metricquery;
      };

      constructor(q: Query) {
        super(q.execute);
        this._metricquery = q;
      }
    }
  }
}
