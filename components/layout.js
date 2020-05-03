import Head from 'next/head'
import Header from './header'

const Layout = props => (
  <>
    <main>
      <div className="container">{props.children}</div>
    </main>
  </>
)

export default Layout
