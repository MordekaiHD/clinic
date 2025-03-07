import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import ModalOpen from './ModalOpen';
import UserCards from './UserCards';
import Header from './Header';

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [addedUsers, setAddedUsers] = useState([]);
  const [userToDelete, setUserToDelete] = useState(null);

  // Эффект для отключения скроллинга при открытии модального окна
  useEffect(() => {
    if (isModalOpen) {
      document.body.classList.add('no-scroll');
    } else {
      document.body.classList.remove('no-scroll');
    }

    // Очистка эффекта при размонтировании компонента
    return () => {
      document.body.classList.remove('no-scroll');
    };
  }, [isModalOpen]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get('https://reqres.in/api/users?per_page=8&page=1');
        console.log('API Response:', response.data); // Выводим данные из API
        const newUsers = response.data.data.map(user => ({
          ...user,
          gender: Math.random() > 0.5 ? 'Male' : 'Female',
          birthDate: new Date(1990 + Math.floor(Math.random() * 20)),
        }));
        setUsers(newUsers);
        localStorage.setItem('users', JSON.stringify(newUsers));
      } catch (error) {
        console.error('Ошибка при загрузке данных:', error);
      }
    };

    fetchUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    return users.filter(user =>
      user.last_name.toLowerCase().includes(inputValue.toLowerCase())
    );
  }, [users, inputValue]);

  const sortedUsers = useMemo(() => {
    if (!sortConfig.key) return filteredUsers;
    return [...filteredUsers].sort((a, b) => {
      return a[sortConfig.key] < b[sortConfig.key]
        ? (sortConfig.direction === 'asc' ? -1 : 1)
        : (sortConfig.direction === 'asc' ? 1 : -1);
    });
  }, [filteredUsers, sortConfig]);

  const handleSearch = (event) => {
    setInputValue(event.target.value);
    setIsDropdownVisible(event.target.value.length > 0);
  };

  const handleUserSelect = (user) => {
    const addedUsersSet = new Set(addedUsers.map(u => u.id));
    if (!addedUsersSet.has(user.id)) {
      setAddedUsers([...addedUsers, user]);
      setInputValue('');
      setIsDropdownVisible(false);
    }
  };

  const hasExactMatch = filteredUsers.some(
    (user) => user.last_name.toLowerCase() === inputValue.toLowerCase()
  );

  const handleAddUserClick = () => {
    setIsModalOpen(true);
    setEditingUser(null); // Передаем null для нового пользователя
    setInputValue('');
    setIsDropdownVisible(false);
  };

  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const handleDelete = async (id) => {
    setUserToDelete(id);
  };

  const confirmDelete = async () => {
    try {
      await axios.delete(`https://reqres.in/api/users/${userToDelete}`);
      const newUsers = users.filter(user => user.id !== userToDelete);
      setUsers(newUsers);
      localStorage.setItem('users', JSON.stringify(newUsers));
      setUserToDelete(null);
    } catch (error) {
      console.error('Ошибка при удалении пользователя:', error);
    }
  };

  const handleEdit = (user) => {
    setEditingUser(user); // Передаем полный объект пользователя
    setIsModalOpen(true);
  };

  const handleSave = (updatedUser) => {
    let newUsers;

    // Разделяем fullName на имя и фамилию
    const [last_name, first_name] = updatedUser.fullName.trim().split(' ');

    // Проверка, что fullName содержит и имя, и фамилию
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
            birthDate: new Date(updatedUser.birthDate)
          }
          : user
      );
    } else {
      // Создание нового пользователя
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
    localStorage.setItem('users', JSON.stringify(newUsers));
    setIsModalOpen(false);
    setEditingUser(null);
  };
  return (

    <div className="main__list__container">
      <Header handleAddUserClick={handleAddUserClick} />
      <div className='main__list__container-input-box'>
        <input
          className="main__list__container-input"
          type="text"
          value={inputValue}
          onChange={handleSearch}
          placeholder="Поиск..."
        />

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

      {isDropdownVisible && (
        <ul className="dropdown-list">
          {filteredUsers.length > 0 ? (
            filteredUsers.map((user) => {
              const isAdded = addedUsers.some(addedUser => addedUser.id === user.id);
              const highlightText = (text, query) => {
                if (!query) return text;
                const regex = new RegExp(query, 'gi');
                return text.replace(regex, (match) => `<strong>${match}</strong>`);
              };

              const highlightedLastName = highlightText(user.last_name, inputValue);

              return (
                <li
                  key={user.id}
                  onClick={() => !isAdded && handleUserSelect(user)}
                  className={`dropdown-item ${isAdded ? 'added' : ''}`}
                  dangerouslySetInnerHTML={{ __html: `${highlightedLastName} ${user.first_name[0]}.` }}
                />
              );
            })
          ) : (
            <li className="no-user-found">
              Пользователя с такими параметрами не найдено, проверьте правильность написания или создайте нового!
            </li>
          )}
          {!hasExactMatch && inputValue.length > 0 && (
            <button onClick={handleAddUserClick} className="add-user-button">
              Добавить Пользователя
            </button>
          )}
        </ul>
      )}

      <UserCards
        sortedUsers={sortedUsers}
        requestSort={requestSort}
        handleEdit={handleEdit}
        handleDelete={handleDelete}
      />

      {isModalOpen && (
        <ModalOpen
          user={editingUser}
          onSave={handleSave}
          onClose={() => setIsModalOpen(false)}
        />
      )}

      {userToDelete && (
        <div className="modal">
          <div className="modal-content">
            <p>Вы уверены, что хотите удалить этого пользователя?</p>
            <button onClick={confirmDelete}>Да</button>
            <button onClick={() => setUserToDelete(null)}>Нет</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserList;