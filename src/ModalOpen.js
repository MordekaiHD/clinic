import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const ModalOpen = ({ user, inputValue, onSave, onClose }) => {
  const isNewUser = !user || (!user.id && !user.last_name && !user.first_name);

  const [isFocused, setIsFocused] = useState({
    fullName: false,
    birthDate: false,
    role: false,
  });

  const handleFocus = (field) => {
    setIsFocused(prevState => ({
      ...prevState,
      [field]: true,
    }));
  };

  const handleBlur = (field) => {
    setIsFocused(prevState => ({
      ...prevState,
      [field]: false,
    }));
  };

  const [formData, setFormData] = useState({
    id: user?.id || null,
    fullName: user ? `${user.last_name} ${user.first_name}` : inputValue, 
    email: user?.email || '',
    gender: user?.gender || 'Male',
    birthDate: user?.birthDate ? new Date(user.birthDate) : null,
    role: user?.role || '',
  });

  const [errors, setErrors] = useState({
    fullName: false,
    birthDate: false,
    role: false,
  });

  useEffect(() => {
    if (isNewUser && inputValue) {
      setFormData(prevState => ({
        ...prevState,
        fullName: inputValue,
      }));
    }
  }, [inputValue, isNewUser]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value,
    }));
    setErrors(prevErrors => ({
      ...prevErrors,
      [name]: !value,
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
    const isValidAge = age >= 18;

    const newErrors = {
      fullName: !formData.fullName,
      birthDate: !formData.birthDate || !isValidAge,
      role: !formData.role,
    };

    setErrors(newErrors);

    return !Object.values(newErrors).some(error => error);
  };

  const handleSubmit = () => {
    if (!validateForm()) {
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
          <div className="modal-content-right-info-full-name">
            Найти в списке
            <img
              className="modal-content-right-info-full-name-img"
              src={errors.fullName ? "/Img/LoupDanger.svg" : "/Img/loupe.svg"}
              alt={errors.fullName ? "error" : "loupe"}
            />
            <input
              className={`modal-content-right-info-full-name-input ${errors.fullName ? 'error' : ''}`}
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              onFocus={() => handleFocus('fullName')}
              onBlur={() => handleBlur('fullName')}
              placeholder=" "
            />
            <span className={`floating-placeholder-full-name ${isFocused.fullName || formData.fullName ? 'active' : ''}`}>
              Пользователь
            </span>
            {errors.fullName && <img className="error-icon-input" src="/Img/Danger.svg" alt="error" />}
          </div>
          <div className="modal-content-right-info-box">
            <div className="date-picker-container">
              <img
                className="modal-content-right-info-box-img"
                src={errors.birthDate ? "/Img/CalendarDanger.svg" : "/Img/Calendar.svg"}
                alt={errors.birthDate ? "error" : "Calendar"}
              />
              <DatePicker
                selected={formData.birthDate}
                onChange={(date) => {
                  setFormData({ ...formData, birthDate: date });
                  setErrors(prevErrors => ({
                    ...prevErrors,
                    birthDate: !date,
                  }));
                }}
                onFocus={() => handleFocus('birthDate')}
                onBlur={() => handleBlur('birthDate')}
                dateFormat="dd.MM.yyyy"
                placeholderText=" "
                isClearable
                className={`birth__date ${errors.birthDate ? 'error' : ''}`}
              />
              <span className={`floating-placeholder-birth-date ${isFocused.birthDate || formData.birthDate ? 'active' : ''}`}>
                Дата рождения
              </span>
              {errors.birthDate && <img className="error-icon-birth-date" src="/Img/Danger.svg" alt="error" />}
            </div>
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
            <div className="role-select">
              <select
                className={`roal ${errors.role ? 'error' : ''}`}
                name="role"
                value={formData.role}
                onChange={handleChange}
                onFocus={() => handleFocus('role')}
                onBlur={() => handleBlur('role')}
              >
                <option value=""> </option>
                <option value="Доктор">Доктор</option>
                <option value="Медбрат">Медбрат</option>
                <option value="Медсестра">Медсестра</option>
                <option value="Админ">Админ</option>
              </select>
              <span className={`floating-placeholder-role ${isFocused.role || formData.role ? 'active' : ''}`}>
                Роль
              </span>
              {errors.role && <img className="error-icon-roal" src="/Img/Danger.svg" alt="error" />}
            </div>
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