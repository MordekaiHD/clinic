import React from 'react';

const UserCards = ({ sortedUsers, handleEdit, handleDelete }) => {
  return (
    <div className="main__cards-container">
      {sortedUsers.map(user => (
        <div key={user.id} className="main__cards-container-card">
          <img src={user.avatar} alt={`${user.first_name} ${user.last_name}`} className="main__cards-container-avatar" />
          <div className="main__cards-container-info">
            <h3 className='main__cards-container-title'>{`${user.last_name} ${user.first_name[0]}.`}</h3>
            <p className='main__cards-container-email'>{user.email}</p>
            <p className='main__cards-container-birth-date'>{user.birthDate instanceof Date ? user.birthDate.toLocaleDateString() : ''}</p>
            <p className='main__cards-container-gender'><img className="main__cards-container-gender-img" src="/Img/Women.svg" alt='Women' />{user.gender}</p>
            <p className='main__cards-container-role'>{user.role ? user.role : 'Не выбран'}</p>
          </div>
          <div className="main__cards-container-actions">
            <button onClick={() => handleEdit(user)} className="main__cards-container-edit-button">
              <img className="main__cards-container-edit-button-img" src="/Img/Edit.svg" alt='Edit' />
            </button>
            <button onClick={() => handleDelete(user)} className="main__cards-container-delete-button">
              <img className="main__cards-container-delete-button-img" src="/Img/Delete.svg" alt='Delete' />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default UserCards;