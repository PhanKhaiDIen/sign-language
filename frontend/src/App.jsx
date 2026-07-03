import SignPredictor from './components/SignPredictor';

export default function App() {
    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: '#0D0D0D', gap: '12px' }}>
            <h1 style={{ color: '#F5E6C8', fontSize: '1.4rem' }}>Fingerspelling Test</h1>
            <SignPredictor />
        </div>
    );
}