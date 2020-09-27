import _ from "lodash";
import PropTypes from "prop-types";
import React from "react";

import { BouncerWrapper } from "../../BouncerWrapper";
import { RemovableError } from "../../RemovableError";
import { buildURLString } from "../../actions/url-utils";
import { fetchJson } from "../../fetcher";
import ColumnSelect from "../create/ColumnSelect";
import Keep from "./Keep";

function validateRowsCfg(cfg) {
  const { subset } = cfg;
  if (!_.size(subset || [])) {
    return "Missing a column selection!";
  }
  return null;
}

function buildCfg(state) {
  const cfg = _.pick(state, ["keep", "subset"]);
  cfg.subset = _.map(cfg.subset, "value") || null;
  return cfg;
}

class Rows extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      keep: "first",
      subset: null,
      testOutput: null,
      loadingTest: false,
    };
    this.updateState = this.updateState.bind(this);
    this.test = this.test.bind(this);
  }

  updateState(state) {
    const currState = _.assignIn(this.state, state);
    this.setState(currState, () => this.props.updateState({ cfg: buildCfg(currState) }));
  }

  test() {
    this.setState({ loadingTest: true });
    const params = {
      type: "rows",
      cfg: JSON.stringify(buildCfg(this.state)),
      action: "test",
    };
    fetchJson(buildURLString(`/dtale/duplicates/${this.props.dataId}?`, params), testData => {
      if (testData.error) {
        this.setState({
          testOutput: <RemovableError {...testData} />,
          loadingTest: false,
        });
        return;
      }
      this.setState({
        testOutput: (
          <ul>
            <li>
              <b>{testData.results}</b>
              {" duplicate rows will be removed"}
            </li>
          </ul>
        ),
        loadingTest: false,
      });
    });
  }

  render() {
    return (
      <React.Fragment>
        <Keep value={this.state.keep} updateState={this.updateState} />
        <ColumnSelect
          label="Column(s)"
          prop="subset"
          parent={this.state}
          updateState={this.updateState}
          columns={this.props.columns}
          isMulti={true}
        />
        <div className="form-group row">
          <div className="col-md-3" />
          <div className="col-md-8">
            <button className="col-auto btn btn-secondary" onClick={this.test}>
              {"View Duplicates"}
            </button>
          </div>
        </div>
        <div className="form-group row">
          <div className="col-md-3" />
          <div className="col-md-8">
            <div className="input-group">
              <BouncerWrapper showBouncer={this.state.loadingTest}>{this.state.testOutput || ""}</BouncerWrapper>
            </div>
          </div>
        </div>
      </React.Fragment>
    );
  }
}
Rows.displayName = "Rows";
Rows.propTypes = {
  dataId: PropTypes.string,
  updateState: PropTypes.func,
  columns: PropTypes.array,
};

export { Rows, validateRowsCfg };
