import React, { useState } from 'react';
import UserList from './components/UserList';
import CreateUser from './components/CreateUser';
import UserDetails from './components/UserDetails';

const UserInterface = () => {
  const [view, setView] = useState('list');

  const renderComponent = () => {
    switch (view) {
      case 'list':
        return <UserList />;
      case 'create':
        return <CreateUser />;
      case 'details':
        return <UserDetails />;
      default:
        return <UserList />;
    }
  };

  const buttonStyle = {
    padding: '12px 24px',
    marginRight: '12px',
    fontSize: '16px',
    borderRadius: '8px',
    border: 'none',
    backgroundColor: '#007bff',
    color: 'white',
    cursor: 'pointer',
    transition: 'background-color 0.3s',
  };

  const containerStyle = {
    maxWidth: '800px',
    margin: '40px auto',
    padding: '30px',
    border: '1px solid #ccc',
    borderRadius: '12px',
    boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
    backgroundColor: '#f9f9f9',
  };

  const headingStyle = {
    fontSize: '28px',
    marginBottom: '20px',
    textAlign: 'center',
    color: '#333',
  };

  return (
    <div style={containerStyle}>
      <h2 style={headingStyle}>Users Panel</h2>
      <div style={{ marginBottom: '30px', textAlign: 'center' }}>
        <button style={buttonStyle} onClick={() => setView('list')}>
          📋 List Users
        </button>
        <button style={buttonStyle} onClick={() => setView('create')}>
          ➕ Create User
        </button>
        <button style={buttonStyle} onClick={() => setView('details')}>
          👤 User Details
        </button>
      </div>
      <div>{renderComponent()}</div>
    </div>
  );
};

export default UserInterface;
