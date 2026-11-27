import { useEffect, useState } from 'react'
import ActivityView from '../teams-demo/ActivityView'
import AppRail from '../teams-demo/AppRail'
import AppsView from '../teams-demo/AppsView'
import CalendarView from '../teams-demo/CalendarView'
import ChatList from '../teams-demo/ChatList'
import Conversation from '../teams-demo/Conversation'
import { ACTIVITY, CHATS, EVENTS, PERSONAS, TEAMS } from '../teams-demo/data'
import PlaceholderView from '../teams-demo/PlaceholderView'
import TeamsView from '../teams-demo/TeamsView'
import TitleBar from '../teams-demo/TitleBar'
import Toast from '../teams-demo/Toast'
import TrajectoiresTab from '../teams-demo/TrajectoiresTab'
import '../teams-demo/teams-demo.css'

const TOASTS = {
  rh: { text: 'Rappel : entretien de parcours professionnel de Karim Haddad dans 45 jours.', path: '/alertes' },
  membre: { text: 'Ton questionnaire Oct – Déc 2026 est disponible. Tes réponses restent privées.', path: '/mes-questionnaires' },
}

/** Maquette de Teams pour la démo vidéo : Trajectoires y est une application parmi les autres. */
export default function TeamsDemoPage() {
  const [persona, setPersona] = useState('rh')
  const [view, setView] = useState('conversation')
  const [chats, setChats] = useState(CHATS)
  const [chatId, setChatId] = useState('equipe-rh')
  const [appPath, setAppPath] = useState(PERSONAS.rh.home)
  const [presence, setPresence] = useState('available')
  const [theme, setTheme] = useState('light')
  const [toast, setToast] = useState(null)

  const me = PERSONAS[persona]
  const personaChats = chats[persona]
  const chat = personaChats.find((c) => c.id === chatId) ?? personaChats[0]

  // Une notification arrive quelques secondes après l'ouverture (et après chaque changement de compte)
  useEffect(() => {
    setToast(null)
    const t = setTimeout(() => setToast(TOASTS[persona]), 6000)
    return () => clearTimeout(t)
  }, [persona])

  const openTrajectoires = (path) => {
    setAppPath(path ?? me.home)
    setView('trajectoires')
    setToast(null)
  }

  const selectChat = (id) => {
    setChatId(id)
    setView('conversation')
    setChats((all) => ({ ...all, [persona]: all[persona].map((c) => (c.id === id ? { ...c, unread: 0 } : c)) }))
  }

  const send = (text) => {
    const now = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
    const reply =
      chat.with === 'bot'
        ? [{ from: 'bot', time: now, text: "Je ne réponds pas encore aux messages. Ouvre Trajectoires depuis la barre de gauche, ou utilise les boutons de mes cartes." }]
        : []
    setChats((all) => ({
      ...all,
      [persona]: all[persona].map((c) => (c.id === chat.id ? { ...c, typing: null, messages: [...c.messages, { from: 'me', time: now, text }, ...reply] } : c)),
    }))
  }

  const changePersona = (p) => {
    setPersona(p)
    setChatId(CHATS[p][1].id)
    setAppPath(PERSONAS[p].home)
    setView('conversation')
  }

  const badges = {
    activite: ACTIVITY[persona].filter((a) => a.unread).length,
    conversation: personaChats.reduce((n, c) => n + (c.unread ?? 0), 0),
  }

  let main
  if (view === 'conversation') {
    main = (
      <>
        <ChatList chats={personaChats} selected={chat.id} onSelect={selectChat} />
        <Conversation chat={chat} onSend={send} onOpen={openTrajectoires} />
      </>
    )
  } else if (view === 'activite') {
    main = (
      <>
        <ActivityView items={ACTIVITY[persona]} onItem={(a) => (a.path ? openTrajectoires(a.path) : selectChat(a.chat))} />
        <section className="tm-conv tm-empty"><p className="tm-muted">Sélectionnez une notification.</p></section>
      </>
    )
  } else if (view === 'equipes') {
    main = <TeamsView key={persona} teams={TEAMS[persona]} persona={persona} theme={theme} onOpen={openTrajectoires} />
  } else if (view === 'calendrier') {
    main = <CalendarView events={EVENTS[persona]} onOpen={openTrajectoires} />
  } else if (view === 'trajectoires') {
    main = <TrajectoiresTab key={persona} persona={persona} theme={theme} path={appPath} />
  } else if (view === 'applications' || view === 'plus') {
    main = <AppsView onOpenApp={() => openTrajectoires()} />
  } else {
    main = <PlaceholderView view={view} />
  }

  return (
    <div className="tm" data-tm-theme={theme}>
      <TitleBar
        me={me}
        presence={presence}
        onPresence={setPresence}
        theme={theme}
        onTheme={setTheme}
        persona={persona}
        onPersona={changePersona}
      />
      <div className="tm-body">
        <AppRail view={view} onView={(v) => (v === 'trajectoires' ? openTrajectoires() : setView(v))} badges={badges} />
        <div className="tm-main">{main}</div>
      </div>
      <Toast toast={toast} onOpen={openTrajectoires} onClose={() => setToast(null)} />
    </div>
  )
}
