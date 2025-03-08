import React, { useEffect, useState } from 'react';
import axios from 'axios';
import ModalOpen from './ModalOpen';
import UserCards from './UserCards';
import Header from './Header';

const UserList = () => {
  const [users, setUsers] = useState([]); // Все пользователи
  const [inputValue, setInputValue] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [userToDelete, setUserToDelete] = useState(null);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  // eslint-disable-next-line no-unused-vars
  const [filteredUsers, setFilteredUsers] = useState([]); // Для фильтрации и выпадающего списка
  const [dropdownUsers, setDropdownUsers] = useState([]); // Для выпадающего списка
  const [displayedUsers, setDisplayedUsers] = useState([]); // Для UserCards

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
        const response = await axios.get('https://reqres.in/api/users?per_page=12');
        const newUsers = response.data.data.map(user => ({
          ...user,
          gender: Math.random() > 0.5 ? 'Male' : 'Female',
          birthDate: new Date(1990 + Math.floor(Math.random() * 20)),
        }));
        setUsers(newUsers);
        setDisplayedUsers(newUsers); // Устанавливаем пользователей для UserCards
        setFilteredUsers(newUsers); // Устанавливаем пользователей для фильтрации
        setDropdownUsers(newUsers.slice(0, 8)); // Первые 8 пользователей для выпадающего списка
      } catch (error) {
        console.error('Ошибка при загрузке данных:', error);
      }
    };

    fetchUsers();
  }, []);

  const handleSearch = (e) => {
    const value = e.target.value;
    setInputValue(value);
    const filtered = users.filter(user => user.last_name.toLowerCase().includes(value.toLowerCase()));
    setFilteredUsers(filtered); // Обновляем filteredUsers для фильтрации

    // Если нет точного совпадения, показываем кнопку "Добавить"
    if (!filtered.some(user => user.last_name.toLowerCase() === value.toLowerCase())) {
      setDropdownUsers([...filtered, { id: 'add', isAddButton: true }]);
    } else {
      setDropdownUsers(filtered.slice(0, 8)); // Ограничиваем выпадающий список 8 пользователями
    }
  };

  const handleAddUserClick = () => {
    setIsModalOpen(true); // Открываем модальное окно
    setEditingUser(null); // Сбрасываем редактируемого пользователя
  };

  const handleSave = (updatedUser) => {
    let newUsers;

    // Разделяем fullName на last_name и first_name
    const [last_name, first_name] = updatedUser.fullName.trim().split(' ');

    if (!last_name || !first_name) {
      alert('Пожалуйста, введите и имя, и фамилию.');
      return;
    }

    if (updatedUser.id) {
      // Редактирование существующего пользователя
      newUsers = users.map(user =>
        user.id === updatedUser.id
          ? {
            ...user,
            ...updatedUser,
            last_name,
            first_name,
            birthDate: new Date(updatedUser.birthDate),
          }
          : user
      );
    } else {
      // Добавление нового пользователя
      const newUser = {
        ...updatedUser,
        id: users.length + 1,
        avatar: 'https://via.placeholder.com/50',
        email: updatedUser.email || 'default@example.com',
        birthDate: new Date(updatedUser.birthDate),
        last_name,
        first_name,
      };
      newUsers = [newUser, ...users];
    }

    setUsers(newUsers);
    setDisplayedUsers(newUsers); // Обновляем displayedUsers для UserCards
    setFilteredUsers(newUsers); // Обновляем filteredUsers для фильтрации
    localStorage.setItem('users', JSON.stringify(newUsers));
    setIsModalOpen(false);
    setEditingUser(null);
    setInputValue(''); // Очищаем поле ввода после успешного сохранения
    setShowConfirmationModal(true);
  };

  const handleDelete = (user) => {
    setUserToDelete(user);
  };

  const confirmDelete = async () => {
    try {
      await axios.delete(`https://reqres.in/api/users/${userToDelete.id}`);
      const newUsers = users.filter(user => user.id !== userToDelete.id);
      setUsers(newUsers);
      setDisplayedUsers(newUsers); // Обновляем displayedUsers для UserCards
      setFilteredUsers(newUsers); // Обновляем filteredUsers для фильтрации
      localStorage.setItem('users', JSON.stringify(newUsers));
      setUserToDelete(null);
    } catch (error) {
      console.error('Ошибка при удалении пользователя:', error);
    }
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setIsModalOpen(true);
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

        {/* Выпадающий список */}
        {inputValue && (
          <div className="dropdown">
            {dropdownUsers.map(user => (
              user.isAddButton ? (
                <div key="add" className="dropdown-item add-button" onClick={handleAddUserClick}>
                  <p className="dropdown-item add-button-text">Пользователя с такими параметрами не найден, проверьте правильность написнаия или создайте нового!</p>
                  Добавить
                </div>
              ) : (
                <div key={user.id} className={`dropdown-item ${users.some(u => u.id === user.id) ? 'disabled' : ''}`}>
                  {`${user.last_name} ${user.first_name[0]}.`}
                </div>
              )
            ))}
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

      {/* Передаем displayedUsers в UserCards */}
      <UserCards
        sortedUsers={displayedUsers} // Используем displayedUsers
        handleEdit={handleEdit}
        handleDelete={handleDelete}
      />

      {isModalOpen && (
        <ModalOpen
          user={editingUser}
          inputValue={inputValue} // Передаем текущее значение inputValue
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