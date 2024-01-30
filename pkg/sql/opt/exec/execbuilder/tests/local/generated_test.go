// Copyright 2022 The Cockroach Authors.
//
// Use of this software is governed by the Business Source License
// included in the file licenses/BSL.txt.
//
// As of the Change Date specified in that file, in accordance with
// the Business Source License, use of this software will be governed
// by the Apache License, Version 2.0, included in the file
// licenses/APL.txt.

// Code generated by generate-logictest, DO NOT EDIT.

package testlocal

import (
	"os"
	"path/filepath"
	"testing"

	"github.com/cockroachdb/cockroach/pkg/base"
	"github.com/cockroachdb/cockroach/pkg/build/bazel"
	"github.com/cockroachdb/cockroach/pkg/security/securityassets"
	"github.com/cockroachdb/cockroach/pkg/security/securitytest"
	"github.com/cockroachdb/cockroach/pkg/server"
	"github.com/cockroachdb/cockroach/pkg/sql"
	"github.com/cockroachdb/cockroach/pkg/sql/logictest"
	"github.com/cockroachdb/cockroach/pkg/testutils/serverutils"
	"github.com/cockroachdb/cockroach/pkg/testutils/skip"
	"github.com/cockroachdb/cockroach/pkg/testutils/testcluster"
	"github.com/cockroachdb/cockroach/pkg/util/leaktest"
	"github.com/cockroachdb/cockroach/pkg/util/randutil"
)

const configIdx = 0

var execBuildLogicTestDir string

func init() {
	if bazel.BuiltWithBazel() {
		var err error
		execBuildLogicTestDir, err = bazel.Runfile("pkg/sql/opt/exec/execbuilder/testdata")
		if err != nil {
			panic(err)
		}
	} else {
		execBuildLogicTestDir = "../../../../../../sql/opt/exec/execbuilder/testdata"
	}
}

func TestMain(m *testing.M) {
	securityassets.SetLoader(securitytest.EmbeddedAssets)
	randutil.SeedForTests()
	serverutils.InitTestServerFactory(server.TestServerFactory)
	serverutils.InitTestClusterFactory(testcluster.TestClusterFactory)

	defer serverutils.TestingSetDefaultTenantSelectionOverride(
		base.TestIsForStuffThatShouldWorkWithSecondaryTenantsButDoesntYet(76378),
	)()

	os.Exit(m.Run())
}

func runExecBuildLogicTest(t *testing.T, file string) {
	defer sql.TestingOverrideExplainEnvVersion("CockroachDB execbuilder test version")()
	skip.UnderDeadlock(t, "times out and/or hangs")
	serverArgs := logictest.TestServerArgs{
		DisableWorkmemRandomization: true,
		ForceProductionValues:       true,
		// Disable the direct scans in order to keep the output of EXPLAIN (VEC)
		// deterministic.
		DisableDirectColumnarScans: true,
	}
	logictest.RunLogicTest(t, serverArgs, configIdx, filepath.Join(execBuildLogicTestDir, file))
}

// TestLogic_tmp runs any tests that are prefixed with "_", in which a dedicated
// test is not generated for. This allows developers to create and run temporary
// test files that are not checked into the repository, without repeatedly
// regenerating and reverting changes to this file, generated_test.go.
//
// TODO(mgartner): Add file filtering so that individual files can be run,
// instead of all files with the "_" prefix.
func TestLogic_tmp(t *testing.T) {
	defer leaktest.AfterTest(t)()
	var glob string
	glob = filepath.Join(execBuildLogicTestDir, "_*")
	serverArgs := logictest.TestServerArgs{
		DisableWorkmemRandomization: true,
	}
	logictest.RunLogicTests(t, serverArgs, configIdx, glob)
}

func TestExecBuild_aggregate(
	t *testing.T,
) {
	defer leaktest.AfterTest(t)()
	runExecBuildLogicTest(t, "aggregate")
}

func TestExecBuild_array(
	t *testing.T,
) {
	defer leaktest.AfterTest(t)()
	runExecBuildLogicTest(t, "array")
}

func TestExecBuild_autocommit(
	t *testing.T,
) {
	defer leaktest.AfterTest(t)()
	runExecBuildLogicTest(t, "autocommit")
}

func TestExecBuild_call(
	t *testing.T,
) {
	defer leaktest.AfterTest(t)()
	runExecBuildLogicTest(t, "call")
}

func TestExecBuild_cascade(
	t *testing.T,
) {
	defer leaktest.AfterTest(t)()
	runExecBuildLogicTest(t, "cascade")
}

func TestExecBuild_catalog(
	t *testing.T,
) {
	defer leaktest.AfterTest(t)()
	runExecBuildLogicTest(t, "catalog")
}

func TestExecBuild_check_constraints(
	t *testing.T,
) {
	defer leaktest.AfterTest(t)()
	runExecBuildLogicTest(t, "check_constraints")
}

func TestExecBuild_collated_strings(
	t *testing.T,
) {
	defer leaktest.AfterTest(t)()
	runExecBuildLogicTest(t, "collated_strings")
}

func TestExecBuild_ddl(
	t *testing.T,
) {
	defer leaktest.AfterTest(t)()
	runExecBuildLogicTest(t, "ddl")
}

func TestExecBuild_delete(
	t *testing.T,
) {
	defer leaktest.AfterTest(t)()
	runExecBuildLogicTest(t, "delete")
}

func TestExecBuild_distinct(
	t *testing.T,
) {
	defer leaktest.AfterTest(t)()
	runExecBuildLogicTest(t, "distinct")
}

func TestExecBuild_distinct_on(
	t *testing.T,
) {
	defer leaktest.AfterTest(t)()
	runExecBuildLogicTest(t, "distinct_on")
}

func TestExecBuild_enums(
	t *testing.T,
) {
	defer leaktest.AfterTest(t)()
	runExecBuildLogicTest(t, "enums")
}

func TestExecBuild_execute_internally_builtin(
	t *testing.T,
) {
	defer leaktest.AfterTest(t)()
	runExecBuildLogicTest(t, "execute_internally_builtin")
}

func TestExecBuild_explain(
	t *testing.T,
) {
	defer leaktest.AfterTest(t)()
	runExecBuildLogicTest(t, "explain")
}

func TestExecBuild_explain_analyze(
	t *testing.T,
) {
	defer leaktest.AfterTest(t)()
	runExecBuildLogicTest(t, "explain_analyze")
}

func TestExecBuild_explain_env(
	t *testing.T,
) {
	defer leaktest.AfterTest(t)()
	runExecBuildLogicTest(t, "explain_env")
}

func TestExecBuild_explain_gist(
	t *testing.T,
) {
	defer leaktest.AfterTest(t)()
	runExecBuildLogicTest(t, "explain_gist")
}

func TestExecBuild_explain_redact(
	t *testing.T,
) {
	defer leaktest.AfterTest(t)()
	runExecBuildLogicTest(t, "explain_redact")
}

func TestExecBuild_explain_shape(
	t *testing.T,
) {
	defer leaktest.AfterTest(t)()
	runExecBuildLogicTest(t, "explain_shape")
}

func TestExecBuild_expression_index(
	t *testing.T,
) {
	defer leaktest.AfterTest(t)()
	runExecBuildLogicTest(t, "expression_index")
}

func TestExecBuild_fk(
	t *testing.T,
) {
	defer leaktest.AfterTest(t)()
	runExecBuildLogicTest(t, "fk")
}

func TestExecBuild_fk_read_committed(
	t *testing.T,
) {
	defer leaktest.AfterTest(t)()
	runExecBuildLogicTest(t, "fk_read_committed")
}

func TestExecBuild_forecast(
	t *testing.T,
) {
	defer leaktest.AfterTest(t)()
	runExecBuildLogicTest(t, "forecast")
}

func TestExecBuild_forecast1401(
	t *testing.T,
) {
	defer leaktest.AfterTest(t)()
	runExecBuildLogicTest(t, "forecast1401")
}

func TestExecBuild_geospatial(
	t *testing.T,
) {
	defer leaktest.AfterTest(t)()
	runExecBuildLogicTest(t, "geospatial")
}

func TestExecBuild_group_join(
	t *testing.T,
) {
	defer leaktest.AfterTest(t)()
	runExecBuildLogicTest(t, "group_join")
}

func TestExecBuild_guardrails(
	t *testing.T,
) {
	defer leaktest.AfterTest(t)()
	runExecBuildLogicTest(t, "guardrails")
}

func TestExecBuild_hash_sharded_index(
	t *testing.T,
) {
	defer leaktest.AfterTest(t)()
	runExecBuildLogicTest(t, "hash_sharded_index")
}

func TestExecBuild_information_schema(
	t *testing.T,
) {
	defer leaktest.AfterTest(t)()
	runExecBuildLogicTest(t, "information_schema")
}

func TestExecBuild_inner_join(
	t *testing.T,
) {
	defer leaktest.AfterTest(t)()
	runExecBuildLogicTest(t, "inner-join")
}

func TestExecBuild_insert(
	t *testing.T,
) {
	defer leaktest.AfterTest(t)()
	runExecBuildLogicTest(t, "insert")
}

func TestExecBuild_inverted_filter_geospatial(
	t *testing.T,
) {
	defer leaktest.AfterTest(t)()
	runExecBuildLogicTest(t, "inverted_filter_geospatial")
}

func TestExecBuild_inverted_filter_json_array(
	t *testing.T,
) {
	defer leaktest.AfterTest(t)()
	runExecBuildLogicTest(t, "inverted_filter_json_array")
}

func TestExecBuild_inverted_index(
	t *testing.T,
) {
	defer leaktest.AfterTest(t)()
	runExecBuildLogicTest(t, "inverted_index")
}

func TestExecBuild_inverted_index_geospatial(
	t *testing.T,
) {
	defer leaktest.AfterTest(t)()
	runExecBuildLogicTest(t, "inverted_index_geospatial")
}

func TestExecBuild_inverted_index_multi_column(
	t *testing.T,
) {
	defer leaktest.AfterTest(t)()
	runExecBuildLogicTest(t, "inverted_index_multi_column")
}

func TestExecBuild_inverted_join_geospatial(
	t *testing.T,
) {
	defer leaktest.AfterTest(t)()
	runExecBuildLogicTest(t, "inverted_join_geospatial")
}

func TestExecBuild_inverted_join_json_array(
	t *testing.T,
) {
	defer leaktest.AfterTest(t)()
	runExecBuildLogicTest(t, "inverted_join_json_array")
}

func TestExecBuild_inverted_join_multi_column(
	t *testing.T,
) {
	defer leaktest.AfterTest(t)()
	runExecBuildLogicTest(t, "inverted_join_multi_column")
}

func TestExecBuild_join(
	t *testing.T,
) {
	defer leaktest.AfterTest(t)()
	runExecBuildLogicTest(t, "join")
}

func TestExecBuild_join_order(
	t *testing.T,
) {
	defer leaktest.AfterTest(t)()
	runExecBuildLogicTest(t, "join_order")
}

func TestExecBuild_json(
	t *testing.T,
) {
	defer leaktest.AfterTest(t)()
	runExecBuildLogicTest(t, "json")
}

func TestExecBuild_limit(
	t *testing.T,
) {
	defer leaktest.AfterTest(t)()
	runExecBuildLogicTest(t, "limit")
}

func TestExecBuild_lookup_join_limit(
	t *testing.T,
) {
	defer leaktest.AfterTest(t)()
	runExecBuildLogicTest(t, "lookup_join_limit")
}

func TestExecBuild_lookup_join_spans(
	t *testing.T,
) {
	defer leaktest.AfterTest(t)()
	runExecBuildLogicTest(t, "lookup_join_spans")
}

func TestExecBuild_lookup_join_trace(
	t *testing.T,
) {
	defer leaktest.AfterTest(t)()
	runExecBuildLogicTest(t, "lookup_join_trace")
}

func TestExecBuild_materialized_view(
	t *testing.T,
) {
	defer leaktest.AfterTest(t)()
	runExecBuildLogicTest(t, "materialized_view")
}

func TestExecBuild_mvcc(
	t *testing.T,
) {
	defer leaktest.AfterTest(t)()
	runExecBuildLogicTest(t, "mvcc")
}

func TestExecBuild_not_visible_index(
	t *testing.T,
) {
	defer leaktest.AfterTest(t)()
	runExecBuildLogicTest(t, "not_visible_index")
}

func TestExecBuild_observability(
	t *testing.T,
) {
	defer leaktest.AfterTest(t)()
	runExecBuildLogicTest(t, "observability")
}

func TestExecBuild_orderby(
	t *testing.T,
) {
	defer leaktest.AfterTest(t)()
	runExecBuildLogicTest(t, "orderby")
}

func TestExecBuild_ordinality(
	t *testing.T,
) {
	defer leaktest.AfterTest(t)()
	runExecBuildLogicTest(t, "ordinality")
}

func TestExecBuild_partial_index(
	t *testing.T,
) {
	defer leaktest.AfterTest(t)()
	runExecBuildLogicTest(t, "partial_index")
}

func TestExecBuild_partial_stats(
	t *testing.T,
) {
	defer leaktest.AfterTest(t)()
	runExecBuildLogicTest(t, "partial_stats")
}

func TestExecBuild_prepare(
	t *testing.T,
) {
	defer leaktest.AfterTest(t)()
	runExecBuildLogicTest(t, "prepare")
}

func TestExecBuild_range_stats(
	t *testing.T,
) {
	defer leaktest.AfterTest(t)()
	runExecBuildLogicTest(t, "range_stats")
}

func TestExecBuild_scalar(
	t *testing.T,
) {
	defer leaktest.AfterTest(t)()
	runExecBuildLogicTest(t, "scalar")
}

func TestExecBuild_schema_change_in_txn(
	t *testing.T,
) {
	defer leaktest.AfterTest(t)()
	runExecBuildLogicTest(t, "schema_change_in_txn")
}

func TestExecBuild_secondary_index_column_families(
	t *testing.T,
) {
	defer leaktest.AfterTest(t)()
	runExecBuildLogicTest(t, "secondary_index_column_families")
}

func TestExecBuild_select(
	t *testing.T,
) {
	defer leaktest.AfterTest(t)()
	runExecBuildLogicTest(t, "select")
}

func TestExecBuild_select_for_update(
	t *testing.T,
) {
	defer leaktest.AfterTest(t)()
	runExecBuildLogicTest(t, "select_for_update")
}

func TestExecBuild_select_for_update_read_committed(
	t *testing.T,
) {
	defer leaktest.AfterTest(t)()
	runExecBuildLogicTest(t, "select_for_update_read_committed")
}

func TestExecBuild_select_index(
	t *testing.T,
) {
	defer leaktest.AfterTest(t)()
	runExecBuildLogicTest(t, "select_index")
}

func TestExecBuild_select_index_flags(
	t *testing.T,
) {
	defer leaktest.AfterTest(t)()
	runExecBuildLogicTest(t, "select_index_flags")
}

func TestExecBuild_select_index_vectorize_off(
	t *testing.T,
) {
	defer leaktest.AfterTest(t)()
	runExecBuildLogicTest(t, "select_index_vectorize_off")
}

func TestExecBuild_show_trace(
	t *testing.T,
) {
	defer leaktest.AfterTest(t)()
	runExecBuildLogicTest(t, "show_trace")
}

func TestExecBuild_spool(
	t *testing.T,
) {
	defer leaktest.AfterTest(t)()
	runExecBuildLogicTest(t, "spool")
}

func TestExecBuild_sql_activity_stats_compaction(
	t *testing.T,
) {
	defer leaktest.AfterTest(t)()
	runExecBuildLogicTest(t, "sql_activity_stats_compaction")
}

func TestExecBuild_sql_fn(
	t *testing.T,
) {
	defer leaktest.AfterTest(t)()
	runExecBuildLogicTest(t, "sql_fn")
}

func TestExecBuild_sql_statistics_persisted(
	t *testing.T,
) {
	defer leaktest.AfterTest(t)()
	runExecBuildLogicTest(t, "sql_statistics_persisted")
}

func TestExecBuild_srfs(
	t *testing.T,
) {
	defer leaktest.AfterTest(t)()
	runExecBuildLogicTest(t, "srfs")
}

func TestExecBuild_stats(
	t *testing.T,
) {
	defer leaktest.AfterTest(t)()
	runExecBuildLogicTest(t, "stats")
}

func TestExecBuild_straight_join(
	t *testing.T,
) {
	defer leaktest.AfterTest(t)()
	runExecBuildLogicTest(t, "straight_join")
}

func TestExecBuild_subquery(
	t *testing.T,
) {
	defer leaktest.AfterTest(t)()
	runExecBuildLogicTest(t, "subquery")
}

func TestExecBuild_subquery_correlated(
	t *testing.T,
) {
	defer leaktest.AfterTest(t)()
	runExecBuildLogicTest(t, "subquery_correlated")
}

func TestExecBuild_topk(
	t *testing.T,
) {
	defer leaktest.AfterTest(t)()
	runExecBuildLogicTest(t, "topk")
}

func TestExecBuild_tpch_vec(
	t *testing.T,
) {
	defer leaktest.AfterTest(t)()
	runExecBuildLogicTest(t, "tpch_vec")
}

func TestExecBuild_trigram_index(
	t *testing.T,
) {
	defer leaktest.AfterTest(t)()
	runExecBuildLogicTest(t, "trigram_index")
}

func TestExecBuild_tsvector_index(
	t *testing.T,
) {
	defer leaktest.AfterTest(t)()
	runExecBuildLogicTest(t, "tsvector_index")
}

func TestExecBuild_tuple(
	t *testing.T,
) {
	defer leaktest.AfterTest(t)()
	runExecBuildLogicTest(t, "tuple")
}

func TestExecBuild_udf(
	t *testing.T,
) {
	defer leaktest.AfterTest(t)()
	runExecBuildLogicTest(t, "udf")
}

func TestExecBuild_union(
	t *testing.T,
) {
	defer leaktest.AfterTest(t)()
	runExecBuildLogicTest(t, "union")
}

func TestExecBuild_unique(
	t *testing.T,
) {
	defer leaktest.AfterTest(t)()
	runExecBuildLogicTest(t, "unique")
}

func TestExecBuild_unique_read_committed(
	t *testing.T,
) {
	defer leaktest.AfterTest(t)()
	runExecBuildLogicTest(t, "unique_read_committed")
}

func TestExecBuild_update(
	t *testing.T,
) {
	defer leaktest.AfterTest(t)()
	runExecBuildLogicTest(t, "update")
}

func TestExecBuild_update_from(
	t *testing.T,
) {
	defer leaktest.AfterTest(t)()
	runExecBuildLogicTest(t, "update_from")
}

func TestExecBuild_update_read_committed(
	t *testing.T,
) {
	defer leaktest.AfterTest(t)()
	runExecBuildLogicTest(t, "update_read_committed")
}

func TestExecBuild_upsert(
	t *testing.T,
) {
	defer leaktest.AfterTest(t)()
	runExecBuildLogicTest(t, "upsert")
}

func TestExecBuild_upsert_read_committed(
	t *testing.T,
) {
	defer leaktest.AfterTest(t)()
	runExecBuildLogicTest(t, "upsert_read_committed")
}

func TestExecBuild_values(
	t *testing.T,
) {
	defer leaktest.AfterTest(t)()
	runExecBuildLogicTest(t, "values")
}

func TestExecBuild_vectorize_local(
	t *testing.T,
) {
	defer leaktest.AfterTest(t)()
	runExecBuildLogicTest(t, "vectorize_local")
}

func TestExecBuild_vectorize_overloads(
	t *testing.T,
) {
	defer leaktest.AfterTest(t)()
	runExecBuildLogicTest(t, "vectorize_overloads")
}

func TestExecBuild_vectorize_wrapping(
	t *testing.T,
) {
	defer leaktest.AfterTest(t)()
	runExecBuildLogicTest(t, "vectorize_wrapping")
}

func TestExecBuild_virtual(
	t *testing.T,
) {
	defer leaktest.AfterTest(t)()
	runExecBuildLogicTest(t, "virtual")
}

func TestExecBuild_virtual_columns(
	t *testing.T,
) {
	defer leaktest.AfterTest(t)()
	runExecBuildLogicTest(t, "virtual_columns")
}

func TestExecBuild_window(
	t *testing.T,
) {
	defer leaktest.AfterTest(t)()
	runExecBuildLogicTest(t, "window")
}

func TestExecBuild_with(
	t *testing.T,
) {
	defer leaktest.AfterTest(t)()
	runExecBuildLogicTest(t, "with")
}

func TestExecBuild_zigzag_join(
	t *testing.T,
) {
	defer leaktest.AfterTest(t)()
	runExecBuildLogicTest(t, "zigzag_join")
}
