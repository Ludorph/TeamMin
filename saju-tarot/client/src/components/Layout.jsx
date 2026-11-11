function Layout({ onHome, children }) {
  return (
    <div className="app">
      <header className="app-header">
        <button type="button" className="logo" onClick={onHome}>
          ☯ 사주풀이
        </button>
      </header>
      <main className="app-main">{children}</main>
      <footer className="app-footer">
        <p>본 서비스는 오락·참고용입니다. 입력한 생년월일은 서버에 저장되지 않습니다.</p>
      </footer>
    </div>
  );
}

export default Layout;
