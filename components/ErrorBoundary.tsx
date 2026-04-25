import { Component, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <div
            style={{
              padding: "40px 20px",
              textAlign: "center",
              color: "var(--fg-3)",
            }}
          >
            <p style={{ fontSize: 14, fontWeight: 500, marginBottom: 8 }}>
              Something went wrong
            </p>
            <p style={{ fontSize: 12, fontFamily: "var(--font-mono)" }}>
              {this.state.error?.message}
            </p>
          </div>
        )
      );
    }
    return this.props.children;
  }
}
