import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const ModalOpen = ({ user, onSave, onClose }) => {
  const isNewUser = !user || (!user.id && !user.last_name && !user.first_name);

  const [formData, setFormData] = useState({
    id: user?.id || null,
    fullName: user ? `${user.last_name} ${user.first_name}` : '',
    email: user?.email || '',
    gender: user?.gender || 'Male',
    birthDate: user?.birthDate ? new Date(user.birthDate) : null,
    role: user?.role || 'Медсестра',
  });

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleGenderChange = (gender) => {
    setFormData(prevState => ({
      ...prevState,
      gender,
      role: gender === 'Male' ? 'Медбрат' : 'Медсестра',
    }));
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
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content-left"></div>
      <div className="modal-content-right">
        <h2 className='modal-content-right-title'>{isNewUser ? 'Добавить нового пользователя' : 'Редактировать пользователя'}
          <button className="modal-content-right-close" onClick={onClose}><img className="modal-content-right-close-img" src="/Img/Close.svg" alt="Close" /></button>
        </h2>
        <div className="modal-content-right-info">
          <div className="modal-content-right-info-full-name">Найти в списке
            <img className="modal-content-right-info-full-name-img" src="/Img/loupe.svg" alt="loupe" />
            <input
              className="modal-content-right-info-full-name-input"
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="Имя и Фамилия"
            />
          </div>
          <div className="modal-content-right-info-box">
            <img className="modal-content-right-info-box-img" src="/Img/Calendar.svg" alt="Calendar" />
            <DatePicker
              selected={formData.birthDate}
              onChange={(date) => setFormData({ ...formData, birthDate: date })}
              dateFormat="dd.MM.yyyy"
              placeholderText="Дата рождения"
              isClearable
              className="birth__date"
            />
            <div className="gender-buttons">
              <button
                type="button"
                className={`gender-button ${formData.gender === 'Female' ? 'active' : ''}`}
                onClick={() => handleGenderChange('Female')}
              ><img className="gender-button-img" src="/Img/GenderWomen.svg" alt='GenderWomen' />
                Женский
              </button>
              <button
                type="button"
                className={`gender-button ${formData.gender === 'Male' ? 'active' : ''}`}
                onClick={() => handleGenderChange('Male')}
              ><img className="gender-button-img" src="/Img/GenderMan.svg" alt='GenderMan' />
                Мужской
              </button>
            </div>
            <select className='roal' name="role" value={formData.role} onChange={handleChange} >
              <option value="">Роль</option>
              <option value="Доктор">Доктор</option>
              <option value="Медбрат">Медбрат</option>
              <option value="Медсестра">Медсестра</option>
              <option value="Админ">Админ</option>
            </select>
          </div>
        </div>
        <div className="button__box">
          <button onClick={handleSubmit} className="create">
            {isNewUser ? 'Добавить' : 'Обновить'}
          </button>
          <button onClick={onClose} className="cancel">
            Отмена
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalOpen;