import Layout from "./Layout";
import store from "./store/store";
import { Provider } from "react-redux";
function App() {
  return (
    <Provider store={store}>
      <Layout></Layout>
    </Provider>
  );
}

export default App;
