/* eslint-disable */
// @ts-nocheck
import { Route as rootRouteImport } from './routes/__root'
import { Route as IndexRouteImport } from './routes/index'
import { Route as ConnectorsRouteImport } from './routes/connectors'
import { Route as InboxRouteImport } from './routes/inbox'
import { Route as SettingsRouteImport } from './routes/settings'
import { Route as TemplatesRouteImport } from './routes/templates'
import { Route as ApiChatRouteImport } from './routes/api/chat'
import { Route as ProjectsIdRouteImport } from './routes/projects.$id'

const IndexRoute=IndexRouteImport.update({id:'/',path:'/',getParentRoute:()=>rootRouteImport} as any)
const ConnectorsRoute=ConnectorsRouteImport.update({id:'/connectors',path:'/connectors',getParentRoute:()=>rootRouteImport} as any)
const InboxRoute=InboxRouteImport.update({id:'/inbox',path:'/inbox',getParentRoute:()=>rootRouteImport} as any)
const SettingsRoute=SettingsRouteImport.update({id:'/settings',path:'/settings',getParentRoute:()=>rootRouteImport} as any)
const TemplatesRoute=TemplatesRouteImport.update({id:'/templates',path:'/templates',getParentRoute:()=>rootRouteImport} as any)
const ApiChatRoute=ApiChatRouteImport.update({id:'/api/chat',path:'/api/chat',getParentRoute:()=>rootRouteImport} as any)
const ProjectsIdRoute=ProjectsIdRouteImport.update({id:'/projects/$id',path:'/projects/$id',getParentRoute:()=>rootRouteImport} as any)

export interface FileRoutesByFullPath {'/':typeof IndexRoute;'/connectors':typeof ConnectorsRoute;'/inbox':typeof InboxRoute;'/settings':typeof SettingsRoute;'/templates':typeof TemplatesRoute;'/api/chat':typeof ApiChatRoute;'/projects/$id':typeof ProjectsIdRoute}
export interface FileRoutesByTo extends FileRoutesByFullPath {}
export interface FileRoutesById {__root__:typeof rootRouteImport;'/':typeof IndexRoute;'/connectors':typeof ConnectorsRoute;'/inbox':typeof InboxRoute;'/settings':typeof SettingsRoute;'/templates':typeof TemplatesRoute;'/api/chat':typeof ApiChatRoute;'/projects/$id':typeof ProjectsIdRoute}
export interface FileRouteTypes {
 fileRoutesByFullPath:FileRoutesByFullPath;
 fullPaths:'/'|'/connectors'|'/inbox'|'/settings'|'/templates'|'/api/chat'|'/projects/$id';
 fileRoutesByTo:FileRoutesByTo;
 to:'/'|'/connectors'|'/inbox'|'/settings'|'/templates'|'/api/chat'|'/projects/$id';
 id:'__root__'|'/'|'/connectors'|'/inbox'|'/settings'|'/templates'|'/api/chat'|'/projects/$id';
 fileRoutesById:FileRoutesById;
}
export interface RootRouteChildren {IndexRoute:typeof IndexRoute;ConnectorsRoute:typeof ConnectorsRoute;InboxRoute:typeof InboxRoute;SettingsRoute:typeof SettingsRoute;TemplatesRoute:typeof TemplatesRoute;ApiChatRoute:typeof ApiChatRoute;ProjectsIdRoute:typeof ProjectsIdRoute}

declare module '@tanstack/react-router' {
 interface FileRoutesByPath {
  '/':{id:'/';path:'/';fullPath:'/';preLoaderRoute:typeof IndexRouteImport;parentRoute:typeof rootRouteImport}
  '/connectors':{id:'/connectors';path:'/connectors';fullPath:'/connectors';preLoaderRoute:typeof ConnectorsRouteImport;parentRoute:typeof rootRouteImport}
  '/inbox':{id:'/inbox';path:'/inbox';fullPath:'/inbox';preLoaderRoute:typeof InboxRouteImport;parentRoute:typeof rootRouteImport}
  '/settings':{id:'/settings';path:'/settings';fullPath:'/settings';preLoaderRoute:typeof SettingsRouteImport;parentRoute:typeof rootRouteImport}
  '/templates':{id:'/templates';path:'/templates';fullPath:'/templates';preLoaderRoute:typeof TemplatesRouteImport;parentRoute:typeof rootRouteImport}
  '/api/chat':{id:'/api/chat';path:'/api/chat';fullPath:'/api/chat';preLoaderRoute:typeof ApiChatRouteImport;parentRoute:typeof rootRouteImport}
  '/projects/$id':{id:'/projects/$id';path:'/projects/$id';fullPath:'/projects/$id';preLoaderRoute:typeof ProjectsIdRouteImport;parentRoute:typeof rootRouteImport}
 }
}
const rootRouteChildren:RootRouteChildren={IndexRoute,ConnectorsRoute,InboxRoute,SettingsRoute,TemplatesRoute,ApiChatRoute,ProjectsIdRoute}
export const routeTree=rootRouteImport._addFileChildren(rootRouteChildren)._addFileTypes<FileRouteTypes>()
import type { getRouter } from './router.tsx'
declare module '@tanstack/react-start' { interface Register { ssr:true; router:Awaited<ReturnType<typeof getRouter>> } }
