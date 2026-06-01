import { createBrowserRouter } from 'react-router-dom';
import { App } from './App';
import { HomePage } from './pages/HomePage';
import { DetailPage } from './pages/DetailPage';
import { MyPage } from './pages/MyPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'detail/:owner/:repo', element: <DetailPage /> },
      { path: 'my', element: <MyPage /> },
    ],
  },
]);
