import Layout from "./Layout";
import AntdTheme from "./antdTheme";
import store from "./store/store";
import { Provider } from "react-redux";

function App() {
  return (
    <Provider store={store}>
      {
        <AntdTheme>
          <Layout></Layout>
        </AntdTheme>
      }
    </Provider>
  );
}

export default App;
