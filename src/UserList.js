import React, { useEffect, useState } from 'react';
import axios from 'axios';
import ModalOpen from './ModalOpen';

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]); // Для фильтрации
  const [sortedUsers, setSortedUsers] = useState([]); // Для сортировки
  const [inputValue, setInputValue] = useState('');
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [addedUsers, setAddedUsers] = useState([]);


  // Загрузка пользователей
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get('https://reqres.in/api/users?per_page=8&page=1');
        const newUsers = response.data.data.map(user => ({
          ...user,
          gender: Math.random() > 0.5 ? 'Male' : 'Female',
          birthDate: new Date(1990 + Math.floor(Math.random() * 20)),
        }));
        setUsers(newUsers);
        setFilteredUsers(newUsers);
        setSortedUsers(newUsers);
      } catch (error) {
        console.error('Ошибка при загрузке данных:', error);
      }
    };

    fetchUsers();
  }, []);


  // Поиск по фамилии
  const handleSearch = (event) => {
    const value = event.target.value;
    setInputValue(value);
    const filtered = users.filter(user =>
      user.last_name.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredUsers(filtered);
    setIsDropdownVisible(value.length > 0); // Показываем выпадающий список при вводе
  };

  // Выбор пользователя из списка
  const handleUserSelect = (user) => {
    if (!addedUsers.some((addedUser) => addedUser.id === user.id)) {
      setAddedUsers([...addedUsers, user]);
      setInputValue('');
      setIsDropdownVisible(false);
    }
  };

  // Проверка на точное совпадение
  const hasExactMatch = filteredUsers.some(
    (user) => user.last_name.toLowerCase() === inputValue.toLowerCase()
  );

  // Добавление нового пользователя
  const handleAddUserClick = () => {
    setIsModalOpen(true);
  };

  // Сортировка
  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });

    const sorted = [...filteredUsers].sort((a, b) => {
      if (a[key] < b[key]) return direction === 'asc' ? -1 : 1;
      if (a[key] > b[key]) return direction === 'asc' ? 1 : -1;
      return 0;
    });
    setSortedUsers(sorted); // Обновляем sortedUsers
  };

  // Удаление пользователя
  const handleDelete = async (id) => {
    try {
      await axios.delete(`https://reqres.in/api/users/${id}`);
      setUsers(users.filter(user => user.id !== id));
      setFilteredUsers(filteredUsers.filter(user => user.id !== id));
      setSortedUsers(sortedUsers.filter(user => user.id !== id)); // Обновляем sortedUsers
    } catch (error) {
      console.error('Ошибка при удалении пользователя:', error);
    }
  };

  // Редактирование пользователя
  const handleEdit = (user) => {
    setEditingUser(user);
    setIsModalOpen(true);
  };

  // Сохранение изменений
  const handleSave = (updatedUser) => {
    console.log('Получили пользователя:', updatedUser);

    let newUsers;

    if (!updatedUser.id) {
      // Для нового пользователя
      const formattedBirthDate = new Date(updatedUser.birthDate);
      const newUser = {
        ...updatedUser,
        id: users.length + 1,
        avatar: 'https://via.placeholder.com/50',
        birthDate: formattedBirthDate,
      };

      newUsers = [newUser, ...users]; // Создаем новый массив
    } else {
      // Для существующего пользователя
      newUsers = users.map(user =>
        user.id === updatedUser.id
          ? { ...user, ...updatedUser, birthDate: new Date(updatedUser.birthDate) }
          : user
      );
    }

    setUsers(newUsers); // Устанавливаем новый массив

    // Пересчитываем filteredUsers
    const newFilteredUsers = newUsers.filter(user =>
      user.last_name.toLowerCase().includes(inputValue.toLowerCase())
    );
    setFilteredUsers(newFilteredUsers);

    // Пересчитываем sortedUsers
    const newSortedUsers = [...newFilteredUsers].sort((a, b) => {
      if (!sortConfig.key) return 0;
      if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1;
      if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
    setSortedUsers(newSortedUsers);

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

              // Подсветка совпадающих букв
              const highlightText = (text, query) => {
                if (!query) return text; // Если нет запроса, возвращаем исходный текст
                const regex = new RegExp(query, 'gi'); // Создаем регулярное выражение
                return text.replace(regex, (match) => `<strong>${match}</strong>`); // Выделяем совпадения
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
          {sortedUsers.slice(0, 5).map(user => (
            <tr key={user.id}>
              <td>
                <img src={user.avatar} alt={`${user.first_name} ${user.last_name}`} className="avatar" />
              </td>
              <td>{`${user.last_name} ${user.first_name[0]}.`}</td>
              <td>{user.email}</td>
              <td>{user.gender}</td>
              <td>{user.birthDate.toLocaleDateString()}</td>
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

