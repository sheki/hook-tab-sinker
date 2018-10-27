import React, {lazy, Suspense, useState} from "react";
import "./App.css";
import classNames from "classnames";
import Spinner from "./Spinner";

const Tokyo = lazy(() => {
  console.log("TOKYO");
  return import("./Tokyo");
});
const Mexico = lazy(() => {
  console.log("Mexico");
  return import("./Mexico");
});
const London = lazy(() => {
  console.log("LONDON");
  return import("./London");
});

const App = () => {
  const [tab, setTab] = useState("Tokyo");

  return (
    <div className="App">
      <header className="App-header">
        <Tabs activeTab={tab} onTabChange={setTab}>
          <Tab id="Tokyo" name="Tokyo">
            <Tokyo />
          </Tab>
          <Tab id="Mexico" name="Mexico">
            <Mexico />
          </Tab>
          <Tab id="London" name="London">
            <London />
          </Tab>
        </Tabs>
      </header>
    </div>
  );
};

const Tab = () => {
  return null;
};

const Tabs = props => {
  const {activeTab, children, onTabChange} = props;

  const tabs = React.Children.map(children, x => ({
    id: x.props.id,
    name: x.props.name,
    render: x.props.children,
  }));
  return (
    <div className="TabContainer">
      <Suspense fallback={<Spinner />}>
        <TabHeader
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={onTabChange}
        />
        {tabs.map(x => (
          <div key={x.id}>
            <TabFrag
              id={x.id}
              key={x.id}
              activeTab={activeTab}
              render={x.render}
            />
          </div>
        ))}
      </Suspense>
    </div>
  );
};

const TabFrag = props => {
  return <div hidden={props.id !== props.activeTab}>{props.render}</div>;
};

const TabHeader = props => {
  const {tabs, activeTab, loadingTab, onTabChange} = props;

  return (
    <div className="TabHeader">
      {tabs.map(x => (
        <TabItem
          id={x.id}
          key={x.id}
          name={x.name}
          active={x.id === activeTab}
          loading={x.id === loadingTab}
          onTabChange={onTabChange}
        />
      ))}
    </div>
  );
};

const TabItem = props => {
  const {id, name, loading, active, onTabChange} = props;
  const handleTabChange = () => {
    onTabChange(id);
  };
  return (
    <div
      className={classNames("TabItem", {
        ActiveTab: active,
        LoadingTab: loading,
      })}
      onClick={handleTabChange}
    >
      {name}
    </div>
  );
};

export default App;
