import { toast, type ToastOptions } from "react-hot-toast";

const defaultConfig: ToastOptions = {
  position: "top-right",
  duration: 2000,
  style: {
    borderRadius: '8px',
    background: '#333',
    color: '#fff',
  },
};

export const customMessage = {
  success: (msg: string, config: ToastOptions = {}) => 
    toast.success(msg, { ...defaultConfig, ...config }),

  error: (msg: string, config: ToastOptions = {}) => {
    const id = typeof msg === "string" ? msg : "generic-error";
    return toast.error(msg, { ...defaultConfig, id, ...config });
  },

  info: (msg: string, config: ToastOptions = {}) => 
    toast(msg, { ...defaultConfig, icon: 'ℹ️', ...config }),

  warning: (msg: string, config: ToastOptions = {}) => 
    toast(msg, { ...defaultConfig, icon: '⚠️', ...config }),
};