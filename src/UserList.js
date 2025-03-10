import React, { useEffect, useState } from 'react';
import axios from 'axios';
import ModalOpen from './ModalOpen';
import UserCards from './UserCards';
import Header from './Header';

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [userToDelete, setUserToDelete] = useState(null);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  // eslint-disable-next-line no-unused-vars
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [dropdownUsers, setDropdownUsers] = useState([]);
  const [displayedUsers, setDisplayedUsers] = useState([]);

  useEffect(() => {
    if (isModalOpen || showConfirmationModal) {
      document.body.classList.add('no-scroll');
    } else {
      document.body.classList.remove('no-scroll');
    }

    return () => {
      document.body.classList.remove('no-scroll');
    };
  }, [isModalOpen, showConfirmationModal]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const localUsers = JSON.parse(localStorage.getItem('users'));
        if (localUsers) {
          const usersWithDate = localUsers.map(user => ({
            ...user,
            birthDate: new Date(user.birthDate), // Преобразуем строку в объект Date
          }));
          setUsers(usersWithDate);
          setDisplayedUsers(usersWithDate);
          setFilteredUsers(usersWithDate);
          setDropdownUsers(usersWithDate.slice(0, 8));
        } else {
          const response = await axios.get('https://reqres.in/api/users?per_page=12');
          const newUsers = response.data.data.map(user => ({
            ...user,
            gender: Math.random() > 0.5 ? 'Male' : 'Female',
            birthDate: user.birthDate ? new Date(user.birthDate) : new Date('1998-10-24'),
          }));
          localStorage.setItem('users', JSON.stringify(newUsers));
          setUsers(newUsers);
          setDisplayedUsers(newUsers);
          setFilteredUsers(newUsers);
          setDropdownUsers(newUsers.slice(0, 8));
        }
      } catch (error) {
        console.error('Ошибка при загрузке данных:', error);
      }
    };

    fetchUsers();
  }, []);

  const handleSearch = (e) => {
    const value = e.target.value;
    setInputValue(value);
    const filtered = users.filter(user =>
      user.last_name.toLowerCase().includes(value.toLowerCase()) ||
      user.first_name.toLowerCase().includes(value.toLowerCase())
    );

    setFilteredUsers(filtered);

    if (filtered.length === 0) {
      setDropdownUsers([{ id: 'add', isAddButton: true }]);
    } else {
      setDropdownUsers(filtered.slice(0, 8)); 
    }
  };

  const handleAddUserClick = () => {
    setIsModalOpen(true); 
    setEditingUser(null);
  };

  const handleSave = (updatedUser) => {
    let newUsers;

    const [last_name, first_name] = updatedUser.fullName.trim().split(' ');

    if (!last_name || !first_name) {
      alert('Пожалуйста, введите и имя, и фамилию.');
      return;
    }

    if (updatedUser.id) {
      newUsers = users.map(user =>
        user.id === updatedUser.id
          ? {
            ...user,
            ...updatedUser,
            last_name,
            first_name,
            birthDate: updatedUser.birthDate, // Сохраняем дату рождения
          }
          : user
      );
    } else {
      const newUser = {
        ...updatedUser,
        id: Date.now(),
        avatar: '/Img/ProfileIcon.png',
        email: updatedUser.email || `${first_name.toLowerCase()}.${last_name.toLowerCase()}@reqres.in`,
        birthDate: updatedUser.birthDate ? updatedUser.birthDate : new Date('1998-10-24'), // Устанавливаем дату рождения
        last_name,
        first_name,
      };
      newUsers = [newUser, ...users];
    }

    setUsers(newUsers);
    setDisplayedUsers(newUsers);
    setFilteredUsers(newUsers);
    localStorage.setItem('users', JSON.stringify(newUsers.map(user => ({
      ...user,
      birthDate: user.birthDate.toISOString(), // Сохраняем дату в формате ISO
    }))));
    setIsModalOpen(false);
    setEditingUser(null);
    setInputValue('');
    setShowConfirmationModal(true);
  };

  const confirmDelete = async () => {
    try {
      const isLocalUser = userToDelete.id > 12;

      if (!isLocalUser) {
        await axios.delete(`https://reqres.in/api/users/${userToDelete.id}`);
      }

      const newUsers = users.filter(user => user.id !== userToDelete.id);
      setUsers(newUsers);
      setDisplayedUsers(newUsers);
      setFilteredUsers(newUsers);
      localStorage.setItem('users', JSON.stringify(newUsers));
      setUserToDelete(null);
    } catch (error) {
      console.error('Ошибка при удалении пользователя:', error);
    }
  };

  const handleDelete = (user) => {
    setUserToDelete(user);
  };

  const handleEdit = (user) => {
    setEditingUser({
      ...user,
      birthDate: new Date(user.birthDate), // Убедимся, что дата рождения передается как объект Date
    });
    setIsModalOpen(true);
  };

  const formatDate = (date) => {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString(); // Форматируем дату для отображения
  };

  return (
    <div className="main__list__container">
      <Header handleAddUserClick={handleAddUserClick} />
      <div className='main__list__container-input-box'>
        <img className="main__list__container-input-img" src="/Img/loupe.svg" alt="loupe" />

        <input
          className="main__list__container-input"
          type="text"
          value={inputValue}
          onChange={handleSearch}
          placeholder="Поиск..."
        />

        {inputValue && (
          <div className="dropdown">
            {dropdownUsers.length === 0 ? (
              <div className="dropdown-item-add-button" onClick={handleAddUserClick}>
                <p className="dropdown-item-add-button-text">Пользователя с такими параметрами не найден, проверьте правильность написнаия или создайте нового!</p>
                Добавить
              </div>
            ) : (
              dropdownUsers.map(user => (
                user.isAddButton ? (
                  <div key="add" className="dropdown-item-add-button" onClick={handleAddUserClick}>
                    <p className="dropdown-item-add-button-text">Пользователя с такими параметрами <span className="dropdown-item-add-button-text-span">не найден</span>, проверьте правильность написнаия или создайте нового!</p>
                    <p className="dropdown-item-add-button-add"><img className="dropdown-item-add-button-add-img" src="/Img/AddUser.svg" alt='AddUser' /> Добавить пользователя</p>
                  </div>
                ) : (
                  <div key={user.id} className={`dropdown-item ${users.some(u => u.id === user.id) ? 'disabled' : ''}`}>
                    {`${user.last_name} ${user.first_name[0]}.`}
                  </div>
                )
              ))
            )}
          </div>
        )}

        <div className="main__list__container-sort-info">
          <p className="main__list__container-sort-info-full-name">ФИО пользователя
            <span className="main__list__container-sort-info-full-name-span">
              По алфавиту А-Я <img className="main__list__container-sort-info-full-name-span-img" src="/Img/Arrow.svg" alt='Arrow' />
            </span>
          </p>
          <p className="main__list__container-sort-info-contact-details">Контактные данные</p>
          <p className="main__list__container-sort-info-date-of-birth">Дата рождения</p>
          <p className="main__list__container-sort-info-gender">Пол</p>
          <p className="main__list__container-sort-info-role">Роль</p>
        </div>
      </div>

      <UserCards
        sortedUsers={displayedUsers}
        handleEdit={handleEdit}
        handleDelete={handleDelete}
        formatDate={formatDate}
      />

      {isModalOpen && (
        <ModalOpen
          user={editingUser}
          inputValue={inputValue}
          onSave={handleSave}
          onClose={() => setIsModalOpen(false)}
        />
      )}

      {userToDelete && (
        <div className="modal">
          <div className="modal-content">
            <img className="modal-conten-img" src="/Img/ImgDelete.svg" alt="ImgDelete" />
            <p className='modal-content-text'>Вы хотите удалить пользователя:</p>
            <p className='modal-content-user'>{`${userToDelete.last_name} ${userToDelete.first_name}`}</p>
            <div className='modal-content-box'>
              <button className='modal-content-box-button-left' onClick={confirmDelete}>Удалить</button>
              <button className='modal-content-box-button-right' onClick={() => setUserToDelete(null)}>Отменить</button>
            </div>
          </div>
        </div>
      )}

      {showConfirmationModal && (
        <div className="modal">
          <div className="modal-confirmation">
            <img className="modal-confirmation-img" src="/Img/ImgComplet.svg" alt="ImgComplet" />
            <p className='modal-confirmation-text'>Данные успешно сохранены</p>
            <div className='modal-confirmation-box'>
              <button className='modal-confirmation-box-button' onClick={() => setShowConfirmationModal(false)}>Закрыть</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserList;