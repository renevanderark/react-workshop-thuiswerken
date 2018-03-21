import createHistory from 'history/createBrowserHistory';
import qs from "qs";
const history = createHistory();

export default (rootPath = '') => {

  let routeActionMap = {};
  let root = rootPath.replace(/^\//, "");

  const mapPathToRouterAction = (location, action) => {
    const queryParams = qs.parse(location.search.replace(/^\?/, ''));

    const path = location.pathname.replace(root, '');
    for (let rt in routeActionMap) {
      const pathParts = path.split("/");
      const rtParts = rt.split("/");
      if (pathParts.length !== rtParts.length) {
        continue;
      }
      let rtMatch = true;
      let paramMap = {
        ...queryParams
      };
      for (let i = 0; i < pathParts.length; i++) {
        if (!(pathParts[i] === rtParts[i] || rtParts[i].match(/^:/))) {
          rtMatch = false;
          break;
        } else if (rtParts[i].match(/^:/)) {
          paramMap[rtParts[i].replace(/^:/, '')] = pathParts[i];
        }
      }
      if (rtMatch) {
        return routeActionMap[rt](paramMap);
      }
    }
    console.warn(`Unmapped route ${path}`);
  }


  return {
    navigateTo: (path) => history.push(`${root}${path}`),
    mapRoutes: (map) => {
      routeActionMap = map;
      history.listen(mapPathToRouterAction);
      document.addEventListener('DOMContentLoaded', (ev) => mapPathToRouterAction(history.location));
    }
  };
};
