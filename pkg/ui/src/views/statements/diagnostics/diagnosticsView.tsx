// Copyright 2020 The Cockroach Authors.
//
// Use of this software is governed by the Business Source License
// included in the file licenses/BSL.txt.
//
// As of the Change Date specified in that file, in accordance with
// the Business Source License, use of this software will be governed
// by the Apache License, Version 2.0, included in the file
// licenses/APL.txt.

import React from "react";
import { connect } from "react-redux";
import moment from "moment";
import Long from "long";
import classnames from "classnames/bind";

import {
  Button,
  Text,
  TextTypes,
  Table,
  ColumnsConfig,
  DownloadFile,
  DownloadFileRef,
  Anchor,
  Link,
} from "src/components";
import { AdminUIState } from "src/redux/state";
import { getStatementDiagnostics } from "src/util/api";
import { SummaryCard } from "src/views/shared/components/summaryCard";
import {
  selectDiagnosticsReportsByStatementFingerprint,
  selectDiagnosticsReportsCountByStatementFingerprint,
} from "src/redux/statements/statementsSelectors";
import { createStatementDiagnosticsReportAction } from "src/redux/statements";
import { DiagnosticStatusBadge } from "./diagnosticStatusBadge";
import EmptyListIcon from "!!url-loader!assets/emptyState/empty-list-results.svg";
import styles from "./diagnosticsView.module.styl";
import { cockroach } from "src/js/protos";
import IStatementDiagnosticsReport = cockroach.server.serverpb.IStatementDiagnosticsReport;
import StatementDiagnosticsRequest = cockroach.server.serverpb.StatementDiagnosticsRequest;
import { getDiagnosticsStatus, sortByCompletedField, sortByRequestedAtField } from "./diagnosticsUtils";
import { statementDiagnostics } from "src/util/docs";
import { createStatementDiagnosticsAlertLocalSetting } from "src/redux/alerts";
import { trackActivateDiagnostics, trackDownloadDiagnosticsBundle } from "src/util/analytics";
import { EmptyTable } from "@cockroachlabs/admin-ui-components";
import { Download } from "@cockroachlabs/icons";

interface DiagnosticsViewOwnProps {
  statementFingerprint?: string;
}

type DiagnosticsViewProps = DiagnosticsViewOwnProps & MapStateToProps & MapDispatchToProps;

interface DiagnosticsViewState {
  traces: {
    [diagnosticsId: string]: string;
  };
}

const cx = classnames.bind(styles);

export class DiagnosticsView extends React.Component<DiagnosticsViewProps, DiagnosticsViewState> {
  columns: ColumnsConfig<IStatementDiagnosticsReport> = [
    {
      key: "activatedOn",
      title: "Activated on",
      sorter: sortByRequestedAtField,
      defaultSortOrder: "descend",
      render: (_text, record) => {
        const timestamp = record.requested_at.seconds.toNumber() * 1000;
        return moment(timestamp).format("LL[ at ]h:mm a");
      },
    },
    {
      key: "status",
      title: "status",
      sorter: sortByCompletedField,
      width: "160px",
      render: (_text, record) => {
        const status = getDiagnosticsStatus(record);
        return (
          <DiagnosticStatusBadge
            status={status}
            enableTooltip={status !== "READY"}
          />
        );
      },
    },
    {
      key: "actions",
      title: "",
      sorter: false,
      width: "160px",
      render: (_text, record) => {
        if (record.completed) {
          return (
            <div className={cx("crl-statements-diagnostics-view__actions-column")}>
              <Anchor href={`_admin/v1/stmtbundle/${record.statement_diagnostics_id}`}
                 onClick={() => trackDownloadDiagnosticsBundle(record.statement_fingerprint)}>
                <Button
                  size="small"
                  type="flat"
                  iconPosition="left"
                  icon={() => <Download className={cx("crl-statements-diagnostics-view__icon")} />}
                >
                  Bundle (.zip)
                </Button>
              </Anchor>
            </div>
          );
        }
        return null;
      },
    },
  ];

  downloadRef = React.createRef<DownloadFileRef>();

  getStatementDiagnostics = async (diagnosticsId: Long) => {
    const request = new StatementDiagnosticsRequest({ statement_diagnostics_id: diagnosticsId });
    const response = await getStatementDiagnostics(request);
    const trace = response.diagnostics?.trace;
    this.downloadRef.current?.download("statement-diagnostics.json", "application/json", trace);
  }

  onActivateButtonClick = () => {
    const { activate, statementFingerprint } = this.props;
    activate(statementFingerprint);
    trackActivateDiagnostics(statementFingerprint);
  }

  componentWillUnmount() {
    this.props.dismissAlertMessage();
  }

  render() {
    const { diagnosticsReports } = this.props;

    const canRequestDiagnostics = diagnosticsReports.every(diagnostic => diagnostic.completed);

    const dataSource = diagnosticsReports.map((diagnosticsReport, idx) => ({
      ...diagnosticsReport,
      key: idx,
    }));

    return (
      <SummaryCard>
        <div
          className={cx("crl-statements-diagnostics-view__title")}
        >
          <Text
            textType={TextTypes.Heading3}
          >
            Statement diagnostics
          </Text>
          {
            canRequestDiagnostics && (
              <Button
                onClick={this.onActivateButtonClick}
                disabled={!canRequestDiagnostics}
                type="secondary"
                className={cx("crl-statements-diagnostics-view__activate-button")}
              >
                Activate diagnostics
              </Button>
            )
          }
        </div>
        <Table
          noDataMessage={
            <EmptyTable
              title="Activate Statement Diagnostics"
              icon={EmptyListIcon}
              message={
                <>
                  <span>{"When you activate statement diagnostics, CockroachDB will wait for the next query that" +
                  " matches this statement fingerprint. A download button will appear on the statement list and" +
                  " detail pages when the query is ready. The statement diagnostic will include EXPLAIN plans, table" +
                  " statistics, and traces. "}</span>
                  <Anchor href={statementDiagnostics} target="_blank">
                    Learn More
                  </Anchor>
                </>
              }
              footer={
                <Button onClick={this.onActivateButtonClick}>Activate Diagnostics</Button>
              }
            />
          }
          dataSource={dataSource}
          columns={this.columns}
        />
        <div className={cx("crl-statements-diagnostics-view__footer")}>
          <Link to="/reports/statements/diagnosticshistory">All statement diagnostics</Link>
        </div>
        <DownloadFile ref={this.downloadRef}/>
      </SummaryCard>
    );
  }
}

interface MapStateToProps {
  hasData: boolean;
  diagnosticsReports: IStatementDiagnosticsReport[];
}

interface MapDispatchToProps {
  activate: (statementFingerprint: string) => void;
  dismissAlertMessage: () => void;
}

const mapStateToProps = (state: AdminUIState, props: DiagnosticsViewProps): MapStateToProps => {
  const { statementFingerprint } = props;
  const hasData = selectDiagnosticsReportsCountByStatementFingerprint(state, statementFingerprint) > 0;
  const diagnosticsReports = selectDiagnosticsReportsByStatementFingerprint(state, statementFingerprint);
  return {
    hasData,
    diagnosticsReports,
  };
};

const mapDispatchToProps: MapDispatchToProps = {
  activate: createStatementDiagnosticsReportAction,
  dismissAlertMessage: () => createStatementDiagnosticsAlertLocalSetting.set({ show: false }),
};

export default connect<
  MapStateToProps,
  MapDispatchToProps,
  DiagnosticsViewOwnProps
  >(mapStateToProps, mapDispatchToProps)(DiagnosticsView);
