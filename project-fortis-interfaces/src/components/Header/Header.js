import React from 'react';
import '../../styles/Header.css';
import { Link } from 'react-router';

import LanguagePicker from './LanguagePicker';

class Header extends React.Component {
  render() {
    return (
      <nav className="navbar navbar-trans">
        <div>
          { this.renderNavHeader() }
          <div className="navbar-collapse collapse" id="navbar-collapsible">
            { this.renderLeftNav() }
            { this.renderRightNav() }
          </div>
        </div>
      </nav>
    );
  }

  renderLogo() {
    if (!this.props.logo) {
      return null;
    }

    return (
      <img src={this.props.logo} style={{display: 'inline'}} height="48" alt="" />
    );
  }

  renderNavHeader() {
    return (
      <div className="navbar-header">
        <button type="button" className="navbar-toggle" data-toggle="collapse" data-target="#navbar-collapsible">
          <span className="sr-only">Toggle navigation</span>
          <span className="icon-bar"></span>
          <span className="icon-bar"></span>
          <span className="icon-bar"></span>
        </button>
        <a className="navbar-brand text-danger">
          {this.renderLogo()}
          <span className="brandLabel">{this.props.title}</span>
        </a>
      </div>
    );
  }

  renderLeftNav() {
    return (
      <ul className="nav navbar-nav navbar-left">
        <li>{ this.renderDashboardLink() }</li>
        <li>{ this.renderFactsLink() }</li>
        <li>{ this.renderAdminLink() }</li>
      </ul>
    );
  }

  renderDashboardLink() {
    return (
      <Link to={`/site/${this.props.siteName}/`} activeClassName="current">Dashboard</Link>
    );
  }

  renderFactsLink() {
    return (
      <Link to={`/site/${this.props.siteName}/facts/`} activeClassName="current">Facts</Link>
    );
  }

  renderAdminLink() {
    return (
      <Link to={`/site/${this.props.siteName}/admin/`} activeClassName="current">Settings</Link>
    );
  }

  renderLogoutLink() {
    return (
      <a onClick={this.props.logoutCallback}>
        Logout {this.props.userName}
      </a>
    )
  }

  renderRightNav() {
    return (
      <ul className="nav navbar-nav navbar-right">
        { this.props.settings && <li>{ this.renderLanguagePicker() }</li> }
        { this.props.logoutCallback && <li>{ this.renderLogoutLink() }</li> }
      </ul>
    );
  }

  renderLanguagePicker() {
    return (
      <LanguagePicker
        supportedLanguages={this.props.supportedLanguages}
        language={this.props.language}
        category={this.props.category}
        flux={this.props.flux}
      />
    );
  }
};

export default Header;