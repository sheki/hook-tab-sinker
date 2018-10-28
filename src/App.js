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

function genClickLog(log, current) {
  const set = new Set([current]);
  const newLog = [current];
  log.forEach(l => {
    if (!set.has(l)) {
      log.push(l);
      newLog.push(l);
    }
  });
  return newLog;
}

function createSuspenseTree(targetTab, log, child, tabs, handleTabChange) {
  const head = log.shift();

  if (head !== targetTab) {
    console.warn(`expect ${head} to be ${targetTab}`);
  }
  let current = child;

  log.forEach(l => {
    current = (
      <Suspense
        fallback={
          <Fallback
            tabs={tabs}
            prevTab={l}
            activeTab={targetTab}
            onTabChange={handleTabChange}
          />
        }
      >
        {current}
      </Suspense>
    );
  });
  return <Suspense fallback={<Spinner />}>{current}</Suspense>;
}

function reducer(state, action) {
  switch (action.type) {
    case "change":
      if (state.current === action.id) {
        return state;
      }
      return {
        current: action.id,
        prev: state.current,
        clickLog: genClickLog(state.clickLog, action.id),
      };
    case "initial":
      return {
        current: action.id,
        prev: null,
        clickLog: [action.id],
      };
    default:
      throw new Error("bad reducer action");
  }
}

const Tabs = props => {
  const {children, onTabChange, initialTab} = props;
  const [state, dispatch] = useReducer(
    reducer,
    {
      clickLog: [],
      prev: null,
      current: null,
    },
    {type: "initial", id: initialTab}
  );

  const handleTabChange = tab => {
    dispatch({type: "change", id: tab});
    onTabChange(tab);
  };

  const tabs = React.Children.map(children, x => ({
    id: x.props.id,
    name: x.props.name,
    render: x.props.children,
  }));
  const child = (
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
  );

  return (
    <div className="TabContainer">
      {createSuspenseTree(
        state.current,
        [...state.clickLog],
        child,
        tabs,
        handleTabChange
      )}
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
