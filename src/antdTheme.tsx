import zhCN from "antd/locale/zh_CN";
import { App, ConfigProvider, theme } from "antd";
import { useSelector } from "react-redux";
export default function AntdTheme({ children }) {
  const darkMode = useSelector((state: any) => state.setting.darkMode);
  return (
    <ConfigProvider
      locale={zhCN}
      theme={{
        algorithm: darkMode ? theme.darkAlgorithm : theme.defaultAlgorithm,
      }}
    >
      <App message={{ maxCount: 1 }}>{children}</App>
    </ConfigProvider>
  );
}
