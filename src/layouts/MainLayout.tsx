import { Outlet } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar';
import { AiAssistant } from '../components/ai/AiAssistant';

export default function MainLayout() {
    return (
        <div className="min-h-screen bg-slate-50 flex">
            {/* 1. Sidebar (Fixed Width) */}
            <Sidebar />

            {/* 2. Main Content Wrapper */}
            {/* ml-[260px] compensates for the fixed sidebar width */}
            <main className="flex-1 ml-[260px] min-h-screen relative">

                {/* 3. STRICT PADDING CONTAINER */}
                {/* This div enforces the global 'Air' rule. Nothing can touch the edges. */}
                <div className="p-8 lg:p-10 max-w-[1600px] mx-auto w-full">
                    <Outlet />
                </div>

                <AiAssistant />
            </main>
        </div>
    );
}
