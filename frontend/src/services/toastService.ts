import toast from 'react-hot-toast';

export class ToastService {
  static success(message: string) {
    toast.success(message, {
      duration: 4000,
      position: 'top-right',
    });
  }

  static error(message: string) {
    toast.error(message, {
      duration: 5000,
      position: 'top-right',
    });
  }

  static loading(message: string) {
    return toast.loading(message, {
      position: 'top-right',
    });
  }

  static dismiss(toastId?: string) {
    toast.dismiss(toastId);
  }

  static promise<T>(
    promise: Promise<T>,
    messages: {
      loading: string;
      success: string;
      error: string;
    }
  ) {
    return toast.promise(promise, messages, {
      position: 'top-right',
    });
  }
}

export default ToastService;
