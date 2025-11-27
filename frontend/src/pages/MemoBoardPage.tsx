import React from 'react';
import Layout from '../components/layout/Layout';

const MemoBoardPage: React.FC = () => {
    return (
        <Layout showSidebar={false}>
            <div className="memo-page">
                <h1>Memo Board</h1>
                <p>Here will be the draggable memo board (pins, images, create/delete)</p>
            </div>
        </Layout>
    )
}

export default MemoBoardPage