import React, {lazy, Suspense, useState, useReducer} from "react";
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
  const [_, setTab] = useState("Tokyo");

  return (
    <div className="App">
      <header className="App-header">
        <Tabs initialTab="Tokyo" onTabChange={setTab}>
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

function reducer(state, action) {
  switch (action.type) {
    case "change":
      if (state.current === action.id) {
        return state;
      }
      return {current: action.id, prev: state.current};
    case "initial":
      return {prev: null, current: action.id};
    default:
      throw new Error("bad reducer action");
  }
}

const Tabs = props => {
  const {initialTab, children, onTabChange} = props;
  const [state, dispatch] = useReducer(
    reducer,
    {},
    {type: "initial", id: initialTab}
  );
  console.log(state);

  const handleTabChange = tab => {
    dispatch({type: "change", id: tab});
    onTabChange(tab);
  };

  const tabs = React.Children.map(children, x => ({
    id: x.props.id,
    name: x.props.name,
    render: x.props.children,
  }));
  return (
    <div className="TabContainer">
      <Suspense
        fallback={
          <Fallback
            tabs={tabs}
            prevTab={state.prev}
            activeTab={state.current}
            onTabChange={handleTabChange}
          />
        }
      >
        <>
          <TabHeader
            tabs={tabs}
            activeTab={state.current}
            onTabChange={handleTabChange}
          />
          {tabs.map(x => (
            <div key={x.id}>
              <TabFrag
                id={x.id}
                key={x.id}
                activeTab={state.current}
                render={x.render}
              />
            </div>
          ))}
        </>
      </Suspense>
    </div>
  );
};

const Fallback = props => {
  const {prevTab, activeTab, onTabChange, tabs} = props;
  if (prevTab && prevTab !== activeTab) {
    return (
      <>
        <TabHeader
          tabs={tabs}
          activeTab={prevTab}
          loadingTab={activeTab}
          onTabChange={onTabChange}
        />
        {tabs.map(x => (
          <div key={x.id}>
            <TabFrag
              id={x.id}
              key={x.id}
              activeTab={prevTab}
              render={x.render}
            />
          </div>
        ))}
      </>
    );
  }
  return <Spinner />;
};

const TabFrag = props => {
  if (props.id === props.activeTab) {
    return props.render;
  }
  return null;
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
