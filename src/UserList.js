import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import ModalOpen from './ModalOpen';

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [addedUsers, setAddedUsers] = useState([]);
  const [userToDelete, setUserToDelete] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get('https://reqres.in/api/users?per_page=8&page=1');
        const newUsers = response.data.data.map(user => ({
          ...user,
          gender: Math.random() > 0.5 ? 'Male' : 'Female',
          birthDate: new Date(1990 + Math.floor(Math.random() * 20)), // Создаем объект Date
        }));
        setUsers(newUsers);
        localStorage.setItem('users', JSON.stringify(newUsers)); // Сохраняем в localStorage
      } catch (error) {
        console.error('Ошибка при загрузке данных:', error);
      }
    };

    const localUsers = JSON.parse(localStorage.getItem('users'));
    if (localUsers) {
      // Преобразуем birthDate обратно в объект Date
      const usersWithCorrectDates = localUsers.map(user => ({
        ...user,
        birthDate: new Date(user.birthDate), // Преобразуем строку в объект Date
      }));
      setUsers(usersWithCorrectDates);
    } else {
      fetchUsers();
    }
  }, []);

  const filteredUsers = useMemo(() => {
    return users.filter(user =>
      user.last_name.toLowerCase().includes(inputValue.toLowerCase())
    );
  }, [users, inputValue]);

  const sortedUsers = useMemo(() => {
    if (!sortConfig.key) return filteredUsers;
    return [...filteredUsers].sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1;
      if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredUsers, sortConfig]);

  const handleSearch = (event) => {
    setInputValue(event.target.value);
    setIsDropdownVisible(event.target.value.length > 0);
  };

  const handleUserSelect = (user) => {
    if (!addedUsers.some((addedUser) => addedUser.id === user.id)) {
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
    const [last_name, first_name] = inputValue.split(' ');
    setEditingUser({
      last_name: last_name || '',
      first_name: first_name || '',
    });
    setInputValue('');
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
    setEditingUser(user);
    setIsModalOpen(true);
  };

  const handleSave = (updatedUser) => {
    let newUsers;

    if (!updatedUser.id) {
      const formattedBirthDate = new Date(updatedUser.birthDate);
      const newUser = {
        ...updatedUser,
        id: users.length + 1,
        avatar: 'https://via.placeholder.com/50',
        email: updatedUser.email || 'default@example.com',
        birthDate: formattedBirthDate,
      };
      newUsers = [newUser, ...users];
    } else {
      newUsers = users.map(user =>
        user.id === updatedUser.id
          ? { ...user, ...updatedUser, birthDate: new Date(updatedUser.birthDate) }
          : user
      );
    }

    setUsers(newUsers);
    localStorage.setItem('users', JSON.stringify(newUsers));
    setIsModalOpen(false);
    setEditingUser(null);
  };

  return (
    <div className="user-list-container">
      <div>
        <input
          type="text"
          value={inputValue}
          onChange={handleSearch}
          placeholder="Поиск по фамилии"
          className="user-input"
        />
      </div>

      {isDropdownVisible && (
        <ul className="dropdown-list">
          {filteredUsers.length > 0 ? (
            filteredUsers.map((user) => {
              const isAdded = addedUsers.some((addedUser) => addedUser.id === user.id);
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

      <table className="user-table">
        <thead>
          <tr>
            <th>Аватар</th>
            <th onClick={() => requestSort('last_name')}>Полное имя</th>
            <th>Email</th>
            <th onClick={() => requestSort('gender')}>Пол</th>
            <th onClick={() => requestSort('birthDate')}>Дата рождения</th>
            <th>Управление</th>
          </tr>
        </thead>
        <tbody>
          {sortedUsers.map(user => (
            <tr key={user.id}>
              <td>
                <img src={user.avatar} alt={`${user.first_name} ${user.last_name}`} className="avatar" />
              </td>
              <td>{`${user.last_name} ${user.first_name[0]}.`}</td>
              <td>{user.email}</td>
              <td>{user.gender}</td>
              <td>{user.birthDate instanceof Date ? user.birthDate.toLocaleDateString() : ''}</td>
              <td>
                <button onClick={() => handleEdit(user)} className="edit-button">
                  Редактировать
                </button>
                <button onClick={() => handleDelete(user.id)} className="delete-button">
                  Удалить
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {userToDelete && (
        <div className="modal">
          <div className="modal-content">
            <p>Вы уверены, что хотите удалить этого пользователя?</p>
            <button onClick={confirmDelete}>Да</button>
            <button onClick={() => setUserToDelete(null)}>Нет</button>
          </div>
        </div>
      )}

      {isModalOpen && (
        <ModalOpen
          user={editingUser}
          onSave={handleSave}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
};

export default UserList;