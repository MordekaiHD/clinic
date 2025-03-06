import React, { useState } from 'react';

const ModalOpen = ({ user, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    email: user?.email || '',
    gender: user?.gender || '',
    birthDate: user?.birthDate || '',
    role: user?.role || '',
  });

  // Остальной код компонента ModalOpen остается без изменений


  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value,
    }));

    // Обновление роли при изменении пола
    if (name === 'gender') {
      setFormData(prevState => ({
        ...prevState,
        role: value === 'Male' ? 'Медбрат' : 'Медсестра',
      }));
    }
  };

  const validateForm = () => {
    const today = new Date();
    const birthDate = new Date(formData.birthDate);
    const age = today.getFullYear() - birthDate.getFullYear();
    return age >= 18;
  };

  const handleSubmit = () => {
    if (!validateForm()) {
      alert('Пользователь должен быть старше 18 лет');
      return;
    }
    onSave(formData);
    console.log('Отправляем пользователя:', formData);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>{user ? 'Редактировать пользователя' : 'Добавить пользователя'}</h2>
        <input
          type="text"
          name="first_name"
          value={formData.first_name}
          onChange={handleChange}
          placeholder="Имя"
        />
        <input
          type="text"
          name="last_name"
          value={formData.last_name}
          onChange={handleChange}
          placeholder="Фамилия"
        />
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="Email"
        />
        <select name="gender" value={formData.gender} onChange={handleChange}>
          <option value="">Выберите пол</option>
          <option value="Male">Мужской</option>
          <option value="Female">Женский</option>
        </select>
        <input
          type="date"
          name="birthDate"
          value={formData.birthDate}
          onChange={handleChange}
          placeholder="Дата рождения"
        />
        <select name="role" value={formData.role} onChange={handleChange}>
          <option value="">Выберите роль</option>
          <option value="Доктор">Доктор</option>
          <option value="Медбрат">Медбрат</option>
          <option value="Медсестра">Медсестра</option>
          <option value="Админ">Админ</option>
        </select>
        <button onClick={handleSubmit} className="create">
          {user ? 'Обновить' : 'Добавить'}
        </button>
        <button onClick={onClose} className="cancel">
          Отмена
        </button>
      </div>
    </div>
  );
};

export default ModalOpen;