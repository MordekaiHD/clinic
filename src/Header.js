function Header({ handleAddUserClick }) {
  return (
    <header className="header">
      <h1 className="header__title">Пользователи клиники <span className="header__title-span">123 человека</span></h1>
      <button className="header__button" onClick={handleAddUserClick}>
        <img className="header__button-img" src="./Img/Plus.svg" alt="Иконка добавления пользователя" />
        Добавить нового пользователя
      </button>
    </header>
  );
}

export default Header;