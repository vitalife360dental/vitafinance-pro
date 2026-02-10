import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
    children?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Uncaught error:', error, errorInfo);

        // Auto-recover from specific DOM errors
        if (error.message.includes('removeChild') || error.message.includes('NotFoundError')) {
            console.warn('Recovering from DOM error, reloading...');
            // Optional: You could try to perform a soft reset here instead of full reload, 
            // but for safety, regular reload is best. 
            // However, to be less intrusive, we might just want to let the user click "Reload" 
            // BUT usually this error crashes the React tree.
        }
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div style={{ padding: '20px', color: 'red', backgroundColor: '#ffebee', height: '100vh' }}>
                    <h1>Algo salió mal.</h1>
                    <p style={{ color: '#666', marginBottom: '10px' }}>
                        {this.state.error?.message.includes('removeChild')
                            ? 'Ocurrió un error visual momentáneo. Por favor, recarga la página.'
                            : 'Ha ocurrido un error inesperado.'}
                    </p>
                    <pre style={{ background: '#eee', padding: '10px', borderRadius: '4px', fontSize: '0.8em', overflow: 'auto' }}>
                        {this.state.error?.toString()}
                    </pre>
                    <button
                        onClick={() => {
                            localStorage.clear();
                            window.location.reload();
                        }}
                        style={{ marginTop: '20px', padding: '10px 20px', background: 'red', color: 'white', border: 'none', borderRadius: '5px' }}
                    >
                        Borrar Caché y Recargar
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}
