import { Spin } from "antd";

const GlobalLoader = () => {
  return (
    <div className="h-screen w-screen flex items-center justify-center -translate-y-12">
      <Spin />
    </div>
  );
};

export default GlobalLoader;
