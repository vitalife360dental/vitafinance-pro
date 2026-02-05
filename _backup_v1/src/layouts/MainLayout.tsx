import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import AiAssistant from '../components/AiAssistant';

const currentUser = {
    name: 'Dra. Ana Lopez',
    role: 'ADMINISTRADOR',
};

export default function MainLayout() {
    return (
        <div className="app-layout">
            <Sidebar currentUser={currentUser} />
            <main className="main-content relative">
                <Outlet />
                <AiAssistant />
            </main>
        </div>
    );
}
