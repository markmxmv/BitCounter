import { NavLink } from "react-router-dom";
import "./Header.css";
import cn from "classnames";

function Header() {
  return (
    <>
      <div className="header__wrapper">
        <NavLink className="header__logo" to="/">
          <img src="/src/assets/logo2.svg" />
        </NavLink>
        <div className="header__menu">
          <div className="menu__item_cover">
            <NavLink
              className={({ isActive }) =>
                cn("menu__item menu__item_cryptocurrencies", {
                  ["menu__item_active"]: isActive
                })
              }
              to="/"
            >
              Cryptocurrencies
            </NavLink>
          </div>
          <div className="menu__item_cover">
            <NavLink
              className={({ isActive }) =>
                cn("menu__item menu__item_portfolio", {
                  ["menu__item_active"]: isActive
                })
              }
              to="/portfolio"
            >
              Portfolio
            </NavLink>
          </div>
          <div className="menu__item_cover">
            <NavLink
              className={({ isActive }) =>
                cn("menu__item menu__item_about", {
                  ["menu__item_active"]: isActive
                })
              }
              to="/about"
            >
              About
            </NavLink>
          </div>
        </div>
        <NavLink className="header__user menu__item" to="">
          <img src="/src/assets/user.svg" alt="log in" />
        </NavLink>
      </div>
      <hr />
      <div />
    </>
  );
}

export default Header;
