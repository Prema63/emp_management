import React from "react";
import ToastProvider from "./components/ToastProvider.jsx";
import Router from "./Router.jsx";
import { store } from "./redux/store.js";
import { Provider } from "react-redux";


function App() {

  return (
    <Provider store={store}>
      <div>
        <ToastProvider/>
       <Router/>
      </div>
    </Provider>
  );
}

export default App;
