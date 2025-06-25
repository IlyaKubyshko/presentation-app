import React, { ErrorInfo } from 'react';

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(err: Error, info: ErrorInfo) {
    console.error('Renderer crash', err, info.componentStack);
  }
  render() {
    if (this.state.hasError) {
      return <div className="p-8 text-red-600">😕 Щось пішло не так… Перезавантажте сторінку.</div>;
    }
    return this.props.children;
  }
}
