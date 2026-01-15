// /lib/i18n.ts
import { I18n } from "i18n-js";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type AppLocale = "en" | "hr" | "it" | "sl" | "fr" | "de" | "es" | "rs";

const LOCALE_KEY = "famigo.locale";

const en = {
  "tabs": {
    "home": "Home",
    "members": "Members",
    "tasks": "Tasks",
    "settings": "Settings"
  },
  "common": {
    "loading": "Loading...",
    "ok": "OK",
    "cancel": "Cancel",
    "save": "Save",
    "error": "Error",
    "delete": "Delete",
    "copied": "Copied.",
    "copyFailed": "Could not copy.",
    "info": "Info",
    "me": "Me",
    "all": "All"
  },
  "settings": {
    "title": "Settings",
    "subtitle": "Family, language and profile",
    "language": "Language",
    "languageHint": "Choose the interface language.",
    "languageNote": "This change applies to the whole app.",
    "croatian": "Croatian",
    "english": "English",
    "italian": "Italian",
    "slovenian": "Slovenian",
    "french": "French",
    "german": "German",
    "spanish": "Spanish",
    "serbian": "Serbian",
    "myName": "My name",
    "myNamePlaceholder": "Name",
    "nameRequired": "Please enter a name.",
    "saved": "Saved.",
    "family": {
      "notInFamily": "You are not in a family.",
      "statusLine": "Family: {{name}} (Invite: {{code}})",
      "title": "Family"
    },
    "about": "About",
    "account": "Account",
    "aboutLine": "Family app for tasks and organization.",
    "version": "Version",
    "family_not_in_family": "You are not in a family.",
    "btn": {
      "changeLanguage": "Change language ({{lang}})",
      "editName": "Edit name",
      "copy": "Copy",
      "renameFamily": "Rename"
    },
    "msg": {
      "familyRenamed": "Family name updated."
    },
    "renameFamilyTitle": "Rename family",
    "renameFamilyPlaceholder": "Family name",
    "labels": {
      "family": "Family",
      "inviteCode": "Invite code"
    }
  },
  "tasks": {
    "status": {
      "open": "Open",
      "claimed": "Claimed",
      "review": "Needs approval",
      "done": "Done"
    },
    "filter": {
      "all": "All",
      "active": "Active",
      "review": "Needs approval",
      "done": "Done"
    },
    "hideDoneOn": "Hide done: ON",
    "hideDoneOff": "Hide done: OFF",
    "emptyTitle": "No tasks",
    "emptySubtitle": "Create the first task with + New",
    "actionsTitle": "Task actions",
    "edit": "Edit",
    "editTitle": "Edit task",
    "newTitle": "New task",
    "titlePlaceholder": "e.g. Pick up kids",
    "timePlaceholder": "Type (HHMM) e.g. 1630",
    "assignedTo": "Assign to",
    "noAssignee": "Everyone",
    "titleRequired": "Title is required.",
    "deleteConfirm": "Delete this task?",
    "claim": "Claim",
    "unclaim": "Unclaim",
    "requestDone": "Request done",
    "approve": "Approve",
    "reject": "Reject",
    "reset": "Reset",
    "title": "Tasks",
    "heroSub": "Quick filters and overview",
    "new": "+ New",
    "needsApproval": "Needs approval",
    "active": "Active",
    "done": "Done",
    "review": "Review",
    "nextDue": "Next due",
    "action": {
      "doneAuto": "Done",
      "claim": "Claim",
      "requestDone": "Request done",
      "approve": "Approve",
      "reject": "Reject",
      "unclaim": "Unclaim"
    },
    "newPrompt": "What can you do today?",
    "when": "When?",
    "selectedDate": "Selected date",
    "dateNotSet": "—",
    "repeatEveryPlaceholder": "Repeat every ___ days (numbers only)",
    "dateInvalid": "Pick a valid date.",
    "timeInvalid": "Time must be HHMM (e.g. 1630).",
    "calendarMissing": "Calendar picker not installed. Enter DDMM; calendar is optional.",
    "assign": {
      "none": "Not assigned"
    },
    "assignTo": "Assign to",
    "repeat": {
      "autoHint": "Auto complete without approval",
      "days": "Repeat every ___ days (numbers only)",
      "autoOn": "Auto (no approval): ON",
      "none": "Off",
      "auto": "Auto",
      "autoOff": "Auto (no approval): OFF",
      "label": "Repeat"
    },
    "errors": {
      "saveFailed": "Save failed.",
      "deleteFailed": "Delete failed.",
      "actionFailed": "Action failed."
    },
    "datePlaceholder": "DDMM",
    "due": {
      "none": "No due time"
    },
    "calendar": "Calendar",
    "tomorrow": "Tomorrow",
    "today": "Today"
  },
  "today": {
    "title": "Today",
    "familyPrefix": "Family",
    "pills": {
      "total": "Total",
      "open": "Active",
      "done": "Done"
    },
    "anytime": "Any time",
    "morning": "Morning",
    "afternoon": "Afternoon",
    "evening": "Evening",
    "noTime": "No due time",
    "empty": {
      "title": "No tasks today",
      "subtitle": "Add tasks in Tasks and set due date for today.",
      "active": "Everything is done 🎉",
      "done": "No completed tasks today",
      "switch": "Change the filter above or add tasks in Tasks."
    }
  },
  "members": {
    "familyNameFallback": "My Family",
    "editHint": "To edit a member, tap ⋮ on their card.",
    "defaultChild": "Child",
    "role": {
      "parent": "Parent",
      "child": "Child"
    },
    "defaultParent": "Parent",
    "stats": {
      "kids": "Kids",
      "parents": "Parents"
    },
    "doneToday": "Done today",
    "listTitle": "Members list",
    "noMembers": "No members yet."
  },
  "auth": {
    "missingUid": "You are not signed in (member id missing).",
    "invalidEmail": "Enter a valid email.",
    "magicLinkSent": "Check your email for the sign-in link.",
    "magicLinkHelp": "We’ll email you a sign-in link.",
    "loginMagicLink": "Login (magic link)",
    "sendLink": "Send link",
    "logout": "Logout",
    "signedInAs": "Signed in as:"
  },
  "shopping": {
    "title": "Shopping",
    "subtitle": "Shared list for the whole family.",
    "addPlaceholder": "Add an item…",
    "addBtn": "Add",
    "toBuy": "To buy",
    "emptyTitle": "Nothing to buy",
    "emptyBody": "Add items using chips or the input above.",
    "noFamilyTitle": "Shopping",
    "noFamilyBody": "Join or create a family to use shared shopping list.",
    "errorTitle": "Shopping",
    "deleteTitle": "Delete item",
    "deleteBody": "Do you want to remove this item from the list?",
    "suggestedBy": "Suggested by",
    "me": "Me",
    "member": "Member",
    "chip": {
      "detergent": "Laundry detergent",
      "toiletPaper": "Toilet paper",
      "water": "Water",
      "milk": "Milk",
      "bread": "Bread",
      "eggs": "Eggs",
      "fruit": "Fruit",
      "vegetables": "Vegetables",
      "meat": "Meat",
      "cheese": "Cheese",
      "shampoo": "Shampoo",
      "dishSoap": "Dish soap"
    }
  },
  "home": {
    "anytimeHint": "No due date",
    "scope": {
      "family": "Family",
      "kids": "Kids"
    },
    "stats": {
      "active": "Active",
      "review": "Needs approval",
      "done": "Done"
    },
    "doneHint": "Recently completed",
    "emptyTitle": "No tasks",
    "reviewTitle": "Needs approval",
    "todayHint": "Focus",
    "anytimeTitle": "Anytime",
    "filterPrefix": "Filter",
    "emptySubtitle": "Add tasks to get started.",
    "doneTitle": "Done",
    "familyPrefix": "Family",
    "reviewHint": "Waiting for your decision",
    "badge": {
      "attention": "ATTN"
    },
    "reviewHintChild": "Waiting for parent",
    "todayTitle": "Today",
    "tagline": "Family tasks made simple",
    "upcomingHint": "Next 7 days",
    "upcomingTitle": "Upcoming",
    "subtitle": "Quick overview"
  }
};

const hr = {
  "tabs": {
    "home": "Danas",
    "members": "Članovi",
    "tasks": "Zadaci",
    "settings": "Postavke"
  },
  "common": {
    "loading": "Učitavam...",
    "ok": "U redu",
    "cancel": "Odustani",
    "save": "Spremi",
    "error": "Greška",
    "delete": "Obriši",
    "copied": "Kopirano.",
    "copyFailed": "Ne mogu kopirati.",
    "all": "Sve",
    "info": "Info",
    "me": "Ja"
  },
  "settings": {
    "title": "Postavke",
    "subtitle": "Obitelj, jezik i profil",
    "language": "Jezik",
    "languageHint": "Odaberi jezik sučelja.",
    "languageNote": "Ova promjena vrijedi za cijelu aplikaciju.",
    "croatian": "Hrvatski",
    "english": "Engleski",
    "italian": "Talijanski",
    "slovenian": "Slovenski",
    "french": "Francuski",
    "german": "Njemački",
    "spanish": "Španjolski",
    "serbian": "Srpski",
    "myName": "Moje ime",
    "myNamePlaceholder": "Ime",
    "nameRequired": "Upiši ime.",
    "saved": "Spremljeno.",
    "family": {
      "notInFamily": "Nisi u obitelji.",
      "statusLine": "Obitelj: {{name}} (Poziv: {{code}})",
      "title": "Obitelj"
    },
    "about": "O aplikaciji",
    "account": "Račun",
    "aboutLine": "Obiteljska aplikacija za zadatke i organizaciju.",
    "version": "Verzija",
    "family_not_in_family": "Nisi u obitelji.",
    "btn": {
      "changeLanguage": "Promijeni jezik ({{lang}})",
      "editName": "Uredi ime",
      "copy": "Kopiraj",
      "renameFamily": "Preimenuj"
    },
    "msg": {
      "familyRenamed": "Naziv obitelji ažuriran."
    },
    "renameFamilyTitle": "Promijeni naziv obitelji",
    "renameFamilyPlaceholder": "Naziv obitelji",
    "labels": {
      "family": "Obitelj",
      "inviteCode": "Pozivni kod"
    }
  },
  "tasks": {
    "status": {
      "open": "Otvoren",
      "claimed": "Preuzet",
      "review": "Za potvrdu",
      "done": "Gotovo"
    },
    "filter": {
      "all": "Sve",
      "active": "Aktivno",
      "review": "Za potvrdu",
      "done": "Gotovo"
    },
    "hideDoneOn": "Sakrij gotovo: UKLJ",
    "hideDoneOff": "Sakrij gotovo: ISKLJ",
    "emptyTitle": "Nema zadataka",
    "emptySubtitle": "Kreiraj prvi zadatak s + Novi",
    "actionsTitle": "Radnje zadatka",
    "edit": "Uredi",
    "editTitle": "Uredi zadatak",
    "newTitle": "Novi zadatak",
    "titlePlaceholder": "npr. Pokupi djecu",
    "timePlaceholder": "Upiši (HHMM) npr. 1630",
    "assignedTo": "Dodijeli",
    "noAssignee": "Svi",
    "titleRequired": "Naslov je obavezan.",
    "deleteConfirm": "Obrisati ovaj zadatak?",
    "claim": "Preuzmi",
    "unclaim": "Vrati",
    "requestDone": "Traži potvrdu",
    "approve": "Odobri",
    "reject": "Odbij",
    "reset": "Resetiraj",
    "title": "Zadaci",
    "heroSub": "Brzi filteri i pregled",
    "new": "+ Novi",
    "needsApproval": "Za potvrdu",
    "active": "Aktivno",
    "done": "Gotovo",
    "review": "Za potvrdu",
    "nextDue": "Sljedeći termin",
    "action": {
      "doneAuto": "Obavljeno",
      "claim": "Preuzmi",
      "requestDone": "Za potvrdu",
      "approve": "Odobri",
      "reject": "Odbij",
      "unclaim": "Vrati"
    },
    "newPrompt": "Što možeš danas napraviti?",
    "when": "Kada?",
    "selectedDate": "Odabrani datum",
    "dateNotSet": "—",
    "repeatEveryPlaceholder": "Ponavljaj svakih ___ dana (samo broj)",
    "dateInvalid": "Odaberi ispravan datum.",
    "timeInvalid": "Vrijeme mora biti HHMM (npr. 1630).",
    "calendarMissing": "Kalendar nije instaliran. Unesi DDMM; kalendar je opcionalan.",
    "calendar": "Kalendar",
    "datePlaceholder": "Odaberi datum",
    "due": {
      "none": "Bez roka"
    },
    "errors": {
      "actionFailed": "Radnja nije uspjela.",
      "deleteFailed": "Brisanje nije uspjelo.",
      "saveFailed": "Spremanje nije uspjelo."
    },
    "repeat": {
      "auto": "Auto",
      "autoHint": "Automatski završi bez potvrde",
      "autoOff": "Isključeno",
      "autoOn": "Uključeno",
      "days": "Ponovi svakih ___ dana (samo brojevi)",
      "none": "Ne ponavljaj",
      "label": "Ponavljanje"
    },
    "today": "Danas",
    "tomorrow": "Sutra",
    "assignTo": "Dodijeli",
    "assign": {
      "none": "Nije dodijeljeno"
    }
  },
  "today": {
    "title": "Danas",
    "familyPrefix": "Obitelj",
    "pills": {
      "total": "Ukupno",
      "open": "Aktivno",
      "done": "Gotovo"
    },
    "anytime": "Bilo kada",
    "morning": "Prijepodne",
    "afternoon": "Popodne",
    "evening": "Večer",
    "noTime": "Bez roka",
    "empty": {
      "title": "Danas nema zadataka",
      "subtitle": "Dodaj zadatke u Tasks i postavi rok za danas.",
      "active": "Sve je riješeno za danas 🎉",
      "done": "Nema gotovih zadataka danas",
      "switch": "Promijeni filter gore ili dodaj nove zadatke u Tasks."
    }
  },
  "members": {
    "familyNameFallback": "Moja obitelj",
    "editHint": "Za uređivanje člana, dodirni ⋮ na njegovoj kartici.",
    "filter": {
      "all": "Sve",
      "kids": "Djeca",
      "parents": "Roditelji"
    },
    "kids": "Djeca",
    "listTitle": "Popis članova",
    "noMembers": "Još nema članova.",
    "parents": "Roditelji",
    "stats": {
      "parents": "Roditelji",
      "kids": "Djeca",
      "todayDone": "Danas riješeno"
    },
    "defaultParent": "Roditelj",
    "defaultChild": "Dijete",
    "role": {
      "parent": "Roditelj",
      "child": "Dijete"
    },
    "doneToday": "Danas riješeno"
  },
  "auth": {
    "missingUid": "Nisi prijavljen (nedostaje ID člana).",
    "invalidEmail": "Upiši ispravan email.",
    "magicLinkSent": "Provjeri email za link za prijavu.",
    "magicLinkHelp": "Poslat ćemo ti link za prijavu na email.",
    "loginMagicLink": "Prijava (magic link)",
    "sendLink": "Pošalji link",
    "logout": "Odjava",
    "signedInAs": "Prijavljen kao:"
  },
  "shopping": {
    "title": "Kupovina",
    "subtitle": "Zajednička lista za cijelu obitelj.",
    "addPlaceholder": "Dodaj stavku…",
    "addBtn": "Dodaj",
    "toBuy": "Za kupiti",
    "emptyTitle": "Nema ništa za kupiti",
    "emptyBody": "Dodaj stavke pomoću prijedloga ili unosa iznad.",
    "noFamilyTitle": "Kupovina",
    "noFamilyBody": "Pridruži se ili napravi obitelj kako bi koristio zajedničku listu.",
    "errorTitle": "Kupovina",
    "deleteTitle": "Obriši stavku",
    "deleteBody": "Želiš li ukloniti ovu stavku s liste?",
    "suggestedBy": "Predložio/la",
    "me": "Ja",
    "member": "Član",
    "chip": {
      "detergent": "Prašak za rublje",
      "toiletPaper": "Toaletni papir",
      "water": "Voda",
      "milk": "Mlijeko",
      "bread": "Kruh",
      "eggs": "Jaja",
      "fruit": "Voće",
      "vegetables": "Povrće",
      "meat": "Meso",
      "cheese": "Sir",
      "shampoo": "Šampon",
      "dishSoap": "Deterdžent za suđe"
    }
  },
  "home": {
    "anytimeTitle": "Bilo kada",
    "anytimeHint": "Bez roka",
    "badge": {
      "attention": "PAŽNJA"
    },
    "doneTitle": "Riješeno",
    "doneHint": "Nedavno završeno",
    "emptyTitle": "Nema zadataka",
    "emptySubtitle": "Dodaj zadatke i organiziraj dan.",
    "familyPrefix": "Obitelj",
    "filterPrefix": "Filter",
    "reviewTitle": "Za potvrdu",
    "reviewHint": "Čeka tvoju odluku",
    "reviewHintChild": "Čeka roditelja",
    "scope": {
      "family": "Obitelj",
      "kids": "Djeca",
      "me": "Ja"
    },
    "status": {
      "open": "Otvoren"
    },
    "subtitle": "Brzi pregled i fokus",
    "tabAll": "Sve",
    "tabKids": "Djeca",
    "tabMe": "Ja",
    "tagline": "Obiteljski zadaci, jednostavno",
    "todayHint": "Fokus",
    "todayTitle": "Danas",
    "upcomingHint": "Sljedećih 7 dana",
    "upcomingTitle": "Nadolazeće",
    "stats": {
      "active": "Aktivno",
      "review": "Za potvrdu",
      "done": "Riješeno"
    }
  }
};

const it = {
  "tabs": {
    "home": "Oggi",
    "members": "Membri",
    "tasks": "Attività",
    "settings": "Impostazioni"
  },
  "common": {
    "loading": "Caricamento...",
    "ok": "OK",
    "cancel": "Annulla",
    "save": "Salva",
    "error": "Errore",
    "delete": "Elimina",
    "copied": "Copiato.",
    "copyFailed": "Impossibile copiare.",
    "all": "Tutti",
    "info": "Info",
    "me": "Io"
  },
  "settings": {
    "title": "Impostazioni",
    "subtitle": "Famiglia, lingua e profilo",
    "language": "Lingua",
    "languageHint": "Scegli la lingua dell’interfaccia.",
    "languageNote": "Questa modifica vale per tutta l’app.",
    "croatian": "Croato",
    "english": "Inglese",
    "italian": "Italiano",
    "slovenian": "Sloveno",
    "french": "Francese",
    "german": "Tedesco",
    "spanish": "Spagnolo",
    "serbian": "Serbo",
    "family": {
      "notInFamily": "Non sei in una famiglia.",
      "statusLine": "Famiglia: {{name}} (Invito: {{code}})",
      "title": "Famiglia"
    },
    "about": "Info",
    "account": "Account",
    "aboutLine": "App familiare per attività e organizzazione.",
    "version": "Versione",
    "family_not_in_family": "Non sei in una famiglia.",
    "btn": {
      "changeLanguage": "Cambia lingua ({{lang}})",
      "editName": "Modifica nome",
      "copy": "Copia",
      "renameFamily": "Rinomina"
    },
    "msg": {
      "familyRenamed": "Nome famiglia aggiornato."
    },
    "renameFamilyTitle": "Rinomina famiglia",
    "renameFamilyPlaceholder": "Nome famiglia",
    "myName": "Il mio nome",
    "myNamePlaceholder": "Nome",
    "nameRequired": "Inserisci un nome.",
    "saved": "Salvato.",
    "labels": {
      "family": "Famiglia",
      "inviteCode": "Codice invito"
    }
  },
  "tasks": {
    "status": {
      "open": "Aperto",
      "claimed": "Preso",
      "review": "Da approvare",
      "done": "Fatto"
    },
    "filter": {
      "all": "Tutti",
      "active": "Attivi",
      "review": "Da approvare",
      "done": "Fatti"
    },
    "hideDoneOn": "Nascondi fatti: ON",
    "hideDoneOff": "Nascondi fatti: OFF",
    "emptyTitle": "Nessuna attività",
    "emptySubtitle": "Crea la prima attività con + Nuova",
    "actionsTitle": "Azioni attività",
    "edit": "Modifica",
    "editTitle": "Modifica attività",
    "newTitle": "Nuova attività",
    "titlePlaceholder": "es. Prendi i bambini",
    "timePlaceholder": "Scrivi (HHMM) es. 1630",
    "assignedTo": "Assegna a",
    "noAssignee": "Tutti",
    "titleRequired": "Il titolo è obbligatorio.",
    "deleteConfirm": "Eliminare questa attività?",
    "claim": "Prendi",
    "unclaim": "Rilascia",
    "requestDone": "Richiedi conferma",
    "approve": "Approva",
    "reject": "Rifiuta",
    "reset": "Reimposta",
    "calendar": "Calendario",
    "datePlaceholder": "Seleziona una data",
    "due": {
      "none": "Senza scadenza"
    },
    "errors": {
      "actionFailed": "Operazione non riuscita.",
      "deleteFailed": "Eliminazione non riuscita.",
      "saveFailed": "Salvataggio non riuscito."
    },
    "repeat": {
      "auto": "Auto",
      "autoHint": "Completa automaticamente senza approvazione",
      "autoOff": "Disattivato",
      "autoOn": "Attivato",
      "days": "Ripeti ogni ___ giorni (solo numeri)",
      "none": "Non ripetere",
      "label": "Ripeti"
    },
    "today": "Oggi",
    "tomorrow": "Domani",
    "assignTo": "Assegna a",
    "assign": {
      "none": "Non assegnato"
    },
    "title": "Compiti",
    "heroSub": "Filtri rapidi e panoramica",
    "new": "+ Nuovo",
    "newPrompt": "Cosa puoi fare oggi?",
    "when": "Quando?",
    "needsApproval": "Da approvare",
    "nextDue": "Prossima scadenza",
    "action": {
      "claim": "Prendi",
      "unclaim": "Rilascia",
      "requestDone": "Richiedi completamento",
      "approve": "Approva",
      "reject": "Rifiuta",
      "doneAuto": "Fatto"
    },
    "repeatEveryPlaceholder": "Ripeti ogni ___ giorni (solo numeri)",
    "dateInvalid": "Scegli una data valida.",
    "timeInvalid": "L'ora deve essere HHMM (es. 1630).",
    "calendarMissing": "Selettore calendario non installato. Inserisci GGMM; il calendario è opzionale."
  },
  "today": {
    "title": "Oggi",
    "familyPrefix": "Famiglia",
    "pills": {
      "total": "Totale",
      "open": "Attive",
      "done": "Fatte"
    },
    "anytime": "Qualsiasi ora",
    "morning": "Mattina",
    "afternoon": "Pomeriggio",
    "evening": "Sera",
    "noTime": "Senza scadenza",
    "empty": {
      "title": "Nessuna attività oggi",
      "subtitle": "Aggiungi attività in Attività e imposta la scadenza per oggi.",
      "active": "Tutto fatto 🎉",
      "done": "Nessuna attività completata oggi",
      "switch": "Cambia il filtro sopra o aggiungi attività in Attività."
    }
  },
  "members": {
    "familyNameFallback": "La mia famiglia",
    "editHint": "Per modificare un membro, tocca ⋮ sulla sua scheda.",
    "filter": {
      "all": "Tutti",
      "kids": "Bambini",
      "parents": "Genitori"
    },
    "kids": "Bambini",
    "listTitle": "Elenco membri",
    "noMembers": "Nessun membro per ora.",
    "parents": "Genitori",
    "stats": {
      "parents": "Genitori",
      "kids": "Bambini",
      "todayDone": "Oggi completati"
    },
    "defaultParent": "Genitore",
    "defaultChild": "Bambino",
    "role": {
      "parent": "Genitore",
      "child": "Bambino"
    },
    "doneToday": "Fatto oggi"
  },
  "auth": {
    "missingUid": "Non hai effettuato l’accesso (ID membro mancante).",
    "invalidEmail": "Inserisci un’email valida.",
    "magicLinkSent": "Controlla l’email per il link di accesso.",
    "magicLinkHelp": "Ti invieremo un link di accesso via email.",
    "loginMagicLink": "Accedi (magic link)",
    "sendLink": "Invia link",
    "logout": "Esci",
    "signedInAs": "Accesso come:"
  },
  "home": {
    "anytimeTitle": "In qualsiasi momento",
    "anytimeHint": "Senza scadenza",
    "badge": {
      "attention": "ATTENZ"
    },
    "doneTitle": "Fatto",
    "doneHint": "Completati di recente",
    "emptyTitle": "Nessun compito",
    "emptySubtitle": "Aggiungi compiti per iniziare.",
    "familyPrefix": "Famiglia",
    "filterPrefix": "Filtro",
    "reviewTitle": "Da approvare",
    "reviewHint": "In attesa della tua decisione",
    "reviewHintChild": "In attesa del genitore",
    "scope": {
      "family": "Famiglia",
      "kids": "Bambini",
      "me": "Io"
    },
    "status": {
      "open": "Aperto"
    },
    "subtitle": "Panoramica rapida",
    "tabAll": "Tutti",
    "tabKids": "Bambini",
    "tabMe": "Io",
    "tagline": "Compiti di famiglia, semplici",
    "todayHint": "Focus",
    "todayTitle": "Oggi",
    "upcomingHint": "Prossimi 7 giorni",
    "upcomingTitle": "In arrivo",
    "stats": {
      "active": "Attivi",
      "review": "Da approvare",
      "done": "Fatti"
    }
  },
  "shopping": {
    "addBtn": "Aggiungi",
    "addPlaceholder": "Aggiungi un elemento…",
    "deleteBody": "Vuoi rimuovere questo elemento dalla lista?",
    "deleteTitle": "Elimina elemento",
    "emptyBody": "Aggiungi elementi usando il campo sopra.",
    "emptyTitle": "Niente da comprare",
    "errorTitle": "Spesa",
    "me": "Io",
    "member": "Membro",
    "noFamilyBody": "Unisciti o crea una famiglia per usare la lista della spesa condivisa.",
    "noFamilyTitle": "Spesa",
    "subtitle": "Lista condivisa per tutta la famiglia.",
    "suggestedBy": "Suggerito da",
    "toBuy": "Da comprare",
    "title": "Spesa"
  }
};

const sl = {
  "tabs": {
    "home": "Danes",
    "members": "Člani",
    "tasks": "Opravila",
    "settings": "Nastavitve"
  },
  "common": {
    "loading": "Nalaganje...",
    "ok": "V redu",
    "cancel": "Prekliči",
    "save": "Shrani",
    "error": "Napaka",
    "delete": "Izbriši",
    "copied": "Kopirano.",
    "copyFailed": "Ni mogoče kopirati.",
    "all": "Vse",
    "info": "Info",
    "me": "Jaz"
  },
  "settings": {
    "title": "Nastavitve",
    "subtitle": "Družina, jezik in profil",
    "language": "Jezik",
    "languageHint": "Izberi jezik vmesnika.",
    "languageNote": "Ta sprememba velja za celotno aplikacijo.",
    "croatian": "Hrvaščina",
    "english": "Angleščina",
    "italian": "Italijanščina",
    "slovenian": "Slovenščina",
    "french": "Francoščina",
    "german": "Nemščina",
    "spanish": "Španščina",
    "serbian": "Srbščina",
    "family": {
      "notInFamily": "Nisi v družini.",
      "statusLine": "Družina: {{name}} (Vabilo: {{code}})",
      "title": "Družina"
    },
    "about": "O aplikaciji",
    "account": "Račun",
    "aboutLine": "Družinska aplikacija za opravila in organizacijo.",
    "version": "Različica",
    "family_not_in_family": "Nisi v družini.",
    "btn": {
      "changeLanguage": "Zamenjaj jezik ({{lang}})",
      "editName": "Uredi ime",
      "copy": "Kopiraj",
      "renameFamily": "Preimenuj"
    },
    "msg": {
      "familyRenamed": "Ime družine posodobljeno."
    },
    "renameFamilyTitle": "Preimenuj družino",
    "renameFamilyPlaceholder": "Ime družine",
    "myName": "Moje ime",
    "myNamePlaceholder": "Ime",
    "nameRequired": "Vnesi ime.",
    "saved": "Shranjeno.",
    "labels": {
      "family": "Družina",
      "inviteCode": "Vabilna koda"
    }
  },
  "tasks": {
    "status": {
      "open": "Odprto",
      "claimed": "Prevzeto",
      "review": "Za potrditev",
      "done": "Končano"
    },
    "filter": {
      "all": "Vse",
      "active": "Aktivno",
      "review": "Za potrditev",
      "done": "Končano"
    },
    "hideDoneOn": "Skrij končano: VKL",
    "hideDoneOff": "Skrij končano: IZKL",
    "emptyTitle": "Ni opravil",
    "emptySubtitle": "Ustvari prvo opravilo z + Novo",
    "actionsTitle": "Dejanja opravila",
    "edit": "Uredi",
    "editTitle": "Uredi opravilo",
    "newTitle": "Novo opravilo",
    "titlePlaceholder": "npr. Poberi otroke",
    "timePlaceholder": "Vnesi (HHMM) npr. 1630",
    "assignedTo": "Dodeli",
    "noAssignee": "Vsi",
    "titleRequired": "Naslov je obvezen.",
    "deleteConfirm": "Izbrišem to opravilo?",
    "claim": "Prevzemi",
    "unclaim": "Vrni",
    "requestDone": "Zahtevaj potrditev",
    "approve": "Odobri",
    "reject": "Zavrni",
    "reset": "Ponastavi",
    "calendar": "Koledar",
    "datePlaceholder": "Izberi datum",
    "due": {
      "none": "Brez roka"
    },
    "errors": {
      "actionFailed": "Dejanje ni uspelo.",
      "deleteFailed": "Brisanje ni uspelo.",
      "saveFailed": "Shranjevanje ni uspelo."
    },
    "repeat": {
      "auto": "Samodejno",
      "autoHint": "Samodejno dokončaj brez potrditve",
      "autoOff": "Izklopljeno",
      "autoOn": "Vklopljeno",
      "days": "Ponovi vsakih ___ dni (samo številke)",
      "none": "Ne ponavljaj",
      "label": "Ponovi"
    },
    "today": "Danes",
    "tomorrow": "Jutri",
    "assignTo": "Dodeli",
    "assign": {
      "none": "Ni dodeljeno"
    },
    "title": "Opravila",
    "heroSub": "Hitri filtri in pregled",
    "new": "+ Novo",
    "newPrompt": "Kaj lahko danes narediš?",
    "when": "Kdaj?",
    "needsApproval": "Za potrditev",
    "nextDue": "Naslednji rok",
    "action": {
      "claim": "Prevzemi",
      "unclaim": "Vrni",
      "requestDone": "Zahtevaj potrditev",
      "approve": "Odobri",
      "reject": "Zavrni",
      "doneAuto": "Opravljeno"
    },
    "repeatEveryPlaceholder": "Ponovi vsakih ___ dni (samo številke)",
    "dateInvalid": "Izberi veljaven datum.",
    "timeInvalid": "Čas mora biti HHMM (npr. 1630).",
    "calendarMissing": "Izbirnik koledarja ni nameščen. Vnesi DDMM; koledar je neobvezen."
  },
  "today": {
    "title": "Danes",
    "familyPrefix": "Družina",
    "pills": {
      "total": "Skupaj",
      "open": "Aktivno",
      "done": "Končano"
    },
    "anytime": "Kadar koli",
    "morning": "Zjutraj",
    "afternoon": "Popoldne",
    "evening": "Zvečer",
    "noTime": "Brez roka",
    "empty": {
      "title": "Danes ni opravil",
      "subtitle": "Dodaj opravila v Opravila in nastavi rok na danes.",
      "active": "Vse je opravljeno 🎉",
      "done": "Danes ni končanih opravil",
      "switch": "Spremeni filter zgoraj ali dodaj opravila v Opravila."
    }
  },
  "members": {
    "familyNameFallback": "Moja družina",
    "editHint": "Za urejanje člana tapni ⋮ na njegovi kartici.",
    "filter": {
      "all": "Vse",
      "kids": "Otroci",
      "parents": "Starši"
    },
    "kids": "Otroci",
    "listTitle": "Seznam članov",
    "noMembers": "Še ni članov.",
    "parents": "Starši",
    "stats": {
      "parents": "Starši",
      "kids": "Otroci",
      "todayDone": "Danes opravljeno"
    },
    "defaultParent": "Starš",
    "defaultChild": "Otrok",
    "role": {
      "parent": "Starš",
      "child": "Otrok"
    },
    "doneToday": "Danes opravljeno"
  },
  "auth": {
    "missingUid": "Nisi prijavljen (manjka ID člana).",
    "invalidEmail": "Vnesi veljaven e‑poštni naslov.",
    "magicLinkSent": "Preveri e‑pošto za prijavni link.",
    "magicLinkHelp": "Po e‑pošti ti bomo poslali prijavni link.",
    "loginMagicLink": "Prijava (magic link)",
    "sendLink": "Pošlji povezavo",
    "logout": "Odjava",
    "signedInAs": "Prijavljen kot:"
  },
  "home": {
    "anytimeTitle": "Kadarkoli",
    "anytimeHint": "Brez roka",
    "badge": {
      "attention": "POZOR"
    },
    "doneTitle": "Opravljeno",
    "doneHint": "Nedavno končano",
    "emptyTitle": "Ni opravil",
    "emptySubtitle": "Dodaj opravila za začetek.",
    "familyPrefix": "Družina",
    "filterPrefix": "Filter",
    "reviewTitle": "Za potrditev",
    "reviewHint": "Čaka na tvojo odločitev",
    "reviewHintChild": "Čaka na starša",
    "scope": {
      "family": "Družina",
      "kids": "Otroci",
      "me": "Jaz"
    },
    "status": {
      "open": "Odprto"
    },
    "subtitle": "Hiter pregled",
    "tabAll": "Vse",
    "tabKids": "Otroci",
    "tabMe": "Jaz",
    "tagline": "Družinska opravila, preprosto",
    "todayHint": "Fokus",
    "todayTitle": "Danes",
    "upcomingHint": "Naslednjih 7 dni",
    "upcomingTitle": "Prihaja",
    "stats": {
      "active": "Aktivno",
      "review": "Za potrditev",
      "done": "Opravljeno"
    }
  },
  "shopping": {
    "addBtn": "Dodaj",
    "addPlaceholder": "Dodaj artikel…",
    "deleteBody": "Želiš odstraniti ta artikel s seznama?",
    "deleteTitle": "Izbriši artikel",
    "emptyBody": "Dodaj artikle z uporabo polja zgoraj.",
    "emptyTitle": "Ni za kupiti",
    "errorTitle": "Nakupi",
    "me": "Jaz",
    "member": "Član",
    "noFamilyBody": "Pridruži se ali ustvari družino za skupni nakupovalni seznam.",
    "noFamilyTitle": "Nakupi",
    "subtitle": "Skupni seznam za vso družino.",
    "suggestedBy": "Predlagal",
    "toBuy": "Za kupiti",
    "title": "Nakupi"
  }
};

const fr = {
  "tabs": {
    "home": "Aujourd’hui",
    "members": "Membres",
    "tasks": "Tâches",
    "settings": "Réglages"
  },
  "common": {
    "loading": "Chargement...",
    "ok": "OK",
    "cancel": "Annuler",
    "save": "Enregistrer",
    "error": "Erreur",
    "delete": "Supprimer",
    "copied": "Copié.",
    "copyFailed": "Impossible de copier.",
    "all": "Tous",
    "info": "Info",
    "me": "Moi"
  },
  "settings": {
    "title": "Réglages",
    "subtitle": "Famille, langue et profil",
    "language": "Langue",
    "languageHint": "Choisissez la langue de l’interface.",
    "languageNote": "Ce changement s’applique à toute l’application.",
    "croatian": "Croate",
    "english": "Anglais",
    "italian": "Italien",
    "slovenian": "Slovène",
    "french": "Français",
    "german": "Allemand",
    "spanish": "Espagnol",
    "serbian": "Serbe",
    "family": {
      "notInFamily": "Vous n’êtes pas dans une famille.",
      "statusLine": "Famille : {{name}} (Invitation : {{code}})",
      "title": "Famille"
    },
    "about": "À propos",
    "account": "Compte",
    "aboutLine": "Application familiale pour les tâches et l’organisation.",
    "version": "Version",
    "family_not_in_family": "Vous n’êtes pas dans une famille.",
    "btn": {
      "changeLanguage": "Changer la langue ({{lang}})",
      "editName": "Modifier le nom",
      "copy": "Copier",
      "renameFamily": "Renommer"
    },
    "msg": {
      "familyRenamed": "Nom de la famille mis à jour."
    },
    "renameFamilyTitle": "Renommer la famille",
    "renameFamilyPlaceholder": "Nom de la famille",
    "myName": "Mon nom",
    "myNamePlaceholder": "Nom",
    "nameRequired": "Veuillez saisir un nom.",
    "saved": "Enregistré.",
    "labels": {
      "family": "Famille",
      "inviteCode": "Code d’invitation"
    }
  },
  "tasks": {
    "status": {
      "open": "Ouverte",
      "claimed": "Prise",
      "review": "À valider",
      "done": "Terminé"
    },
    "filter": {
      "all": "Toutes",
      "active": "Actives",
      "review": "À valider",
      "done": "Terminées"
    },
    "hideDoneOn": "Masquer terminées : ON",
    "hideDoneOff": "Masquer terminées : OFF",
    "emptyTitle": "Aucune tâche",
    "emptySubtitle": "Créez la première tâche avec + Nouveau",
    "actionsTitle": "Actions de la tâche",
    "edit": "Modifier",
    "editTitle": "Modifier la tâche",
    "newTitle": "Nouvelle tâche",
    "titlePlaceholder": "ex. Aller chercher les enfants",
    "timePlaceholder": "Saisir (HHMM) ex. 1630",
    "assignedTo": "Attribuer à",
    "noAssignee": "Tout le monde",
    "titleRequired": "Le titre est obligatoire.",
    "deleteConfirm": "Supprimer cette tâche ?",
    "claim": "Prendre",
    "unclaim": "Rendre",
    "requestDone": "Demander validation",
    "approve": "Approuver",
    "reject": "Refuser",
    "reset": "Réinitialiser",
    "calendar": "Calendrier",
    "datePlaceholder": "Choisir une date",
    "due": {
      "none": "Sans échéance"
    },
    "errors": {
      "actionFailed": "Action échouée.",
      "deleteFailed": "Suppression échouée.",
      "saveFailed": "Enregistrement échoué."
    },
    "repeat": {
      "auto": "Auto",
      "autoHint": "Terminer automatiquement sans approbation",
      "autoOff": "Désactivé",
      "autoOn": "Activé",
      "days": "Répéter tous les ___ jours (chiffres uniquement)",
      "none": "Ne pas répéter",
      "label": "Répéter"
    },
    "today": "Aujourd’hui",
    "tomorrow": "Demain",
    "assignTo": "Attribuer à",
    "assign": {
      "none": "Non attribué"
    },
    "title": "Tâches",
    "heroSub": "Filtres rapides et aperçu",
    "new": "+ Nouvelle",
    "newPrompt": "Que peux-tu faire aujourd’hui ?",
    "when": "Quand ?",
    "needsApproval": "À approuver",
    "nextDue": "Prochaine échéance",
    "action": {
      "claim": "Prendre",
      "unclaim": "Rendre",
      "requestDone": "Demander validation",
      "approve": "Approuver",
      "reject": "Refuser",
      "doneAuto": "Terminé"
    },
    "repeatEveryPlaceholder": "Répéter tous les ___ jours (chiffres uniquement)",
    "dateInvalid": "Choisis une date valide.",
    "timeInvalid": "L’heure doit être HHMM (ex. 1630).",
    "calendarMissing": "Sélecteur calendrier non installé. Saisis JJMM ; le calendrier est optionnel."
  },
  "today": {
    "title": "Aujourd’hui",
    "familyPrefix": "Famille",
    "pills": {
      "total": "Total",
      "open": "Actives",
      "done": "Terminées"
    },
    "anytime": "À tout moment",
    "morning": "Matin",
    "afternoon": "Après‑midi",
    "evening": "Soir",
    "noTime": "Sans échéance",
    "empty": {
      "title": "Aucune tâche aujourd’hui",
      "subtitle": "Ajoute des tâches dans Tâches et fixe l’échéance à aujourd’hui.",
      "active": "Tout est fait 🎉",
      "done": "Aucune tâche terminée aujourd’hui",
      "switch": "Change le filtre ci‑dessus ou ajoute des tâches dans Tâches."
    }
  },
  "members": {
    "familyNameFallback": "Ma famille",
    "editHint": "Pour modifier un membre, touchez ⋮ sur sa carte.",
    "filter": {
      "all": "Tous",
      "kids": "Enfants",
      "parents": "Parents"
    },
    "kids": "Enfants",
    "listTitle": "Liste des membres",
    "noMembers": "Aucun membre pour l’instant.",
    "parents": "Parents",
    "stats": {
      "parents": "Parents",
      "kids": "Enfants",
      "todayDone": "Terminé aujourd’hui"
    },
    "defaultParent": "Parent",
    "defaultChild": "Enfant",
    "role": {
      "parent": "Parent",
      "child": "Enfant"
    },
    "doneToday": "Fait aujourd’hui"
  },
  "auth": {
    "missingUid": "Vous n’êtes pas connecté (ID membre manquant).",
    "invalidEmail": "Saisissez une adresse e‑mail valide.",
    "magicLinkSent": "Vérifiez votre e‑mail pour le lien de connexion.",
    "magicLinkHelp": "Nous vous enverrons un lien de connexion par e‑mail.",
    "loginMagicLink": "Connexion (lien magique)",
    "sendLink": "Envoyer le lien",
    "logout": "Déconnexion",
    "signedInAs": "Connecté en tant que :"
  },
  "home": {
    "anytimeTitle": "N’importe quand",
    "anytimeHint": "Sans échéance",
    "badge": {
      "attention": "ATTN"
    },
    "doneTitle": "Terminé",
    "doneHint": "Récemment terminé",
    "emptyTitle": "Aucune tâche",
    "emptySubtitle": "Ajoutez des tâches pour commencer.",
    "familyPrefix": "Famille",
    "filterPrefix": "Filtre",
    "reviewTitle": "À approuver",
    "reviewHint": "En attente de votre décision",
    "reviewHintChild": "En attente du parent",
    "scope": {
      "family": "Famille",
      "kids": "Enfants",
      "me": "Moi"
    },
    "status": {
      "open": "Ouvert"
    },
    "subtitle": "Aperçu rapide",
    "tabAll": "Tous",
    "tabKids": "Enfants",
    "tabMe": "Moi",
    "tagline": "Les tâches familiales, simplifiées",
    "todayHint": "Focus",
    "todayTitle": "Aujourd’hui",
    "upcomingHint": "7 prochains jours",
    "upcomingTitle": "À venir",
    "stats": {
      "active": "Actives",
      "review": "À approuver",
      "done": "Terminées"
    }
  },
  "shopping": {
    "addBtn": "Ajouter",
    "addPlaceholder": "Ajouter un article…",
    "deleteBody": "Voulez-vous retirer cet article de la liste ?",
    "deleteTitle": "Supprimer l’article",
    "emptyBody": "Ajoutez des articles avec le champ ci-dessus.",
    "emptyTitle": "Rien à acheter",
    "errorTitle": "Courses",
    "me": "Moi",
    "member": "Membre",
    "noFamilyBody": "Rejoignez ou créez une famille pour utiliser la liste de courses partagée.",
    "noFamilyTitle": "Courses",
    "subtitle": "Liste partagée pour toute la famille.",
    "suggestedBy": "Suggéré par",
    "toBuy": "À acheter",
    "title": "Courses"
  }
};

const de = {
  "tabs": {
    "home": "Heute",
    "members": "Mitglieder",
    "tasks": "Aufgaben",
    "settings": "Einstellungen"
  },
  "common": {
    "loading": "Laden...",
    "ok": "OK",
    "cancel": "Abbrechen",
    "save": "Speichern",
    "error": "Fehler",
    "delete": "Löschen",
    "copied": "Kopiert.",
    "copyFailed": "Kopieren nicht möglich.",
    "all": "Alle",
    "info": "Info",
    "me": "Ich"
  },
  "settings": {
    "title": "Einstellungen",
    "subtitle": "Familie, Sprache und Profil",
    "language": "Sprache",
    "languageHint": "Wähle die Sprache der Oberfläche.",
    "languageNote": "Diese Änderung gilt für die gesamte App.",
    "croatian": "Kroatisch",
    "english": "Englisch",
    "italian": "Italienisch",
    "slovenian": "Slowenisch",
    "french": "Französisch",
    "german": "Deutsch",
    "spanish": "Spanisch",
    "serbian": "Serbisch",
    "family": {
      "notInFamily": "Du bist in keiner Familie.",
      "statusLine": "Familie: {{name}} (Einladung: {{code}})",
      "title": "Familie"
    },
    "about": "Über",
    "account": "Konto",
    "aboutLine": "Familien‑App für Aufgaben und Organisation.",
    "version": "Version",
    "family_not_in_family": "Du bist in keiner Familie.",
    "btn": {
      "changeLanguage": "Sprache ändern ({{lang}})",
      "editName": "Name bearbeiten",
      "copy": "Kopieren",
      "renameFamily": "Umbenennen"
    },
    "msg": {
      "familyRenamed": "Familienname aktualisiert."
    },
    "renameFamilyTitle": "Familie umbenennen",
    "renameFamilyPlaceholder": "Familienname",
    "myName": "Mein Name",
    "myNamePlaceholder": "Name",
    "nameRequired": "Bitte einen Namen eingeben.",
    "saved": "Gespeichert.",
    "labels": {
      "family": "Familie",
      "inviteCode": "Einladungscode"
    }
  },
  "tasks": {
    "status": {
      "open": "Offen",
      "claimed": "Übernommen",
      "review": "Zur Freigabe",
      "done": "Erledigt"
    },
    "filter": {
      "all": "Alle",
      "active": "Aktiv",
      "review": "Zur Freigabe",
      "done": "Erledigt"
    },
    "hideDoneOn": "Erledigte ausblenden: AN",
    "hideDoneOff": "Erledigte ausblenden: AUS",
    "emptyTitle": "Keine Aufgaben",
    "emptySubtitle": "Erste Aufgabe mit + Neu erstellen",
    "actionsTitle": "Aufgabenaktionen",
    "edit": "Bearbeiten",
    "editTitle": "Aufgabe bearbeiten",
    "newTitle": "Neue Aufgabe",
    "titlePlaceholder": "z. B. Kinder abholen",
    "timePlaceholder": "Eingabe (HHMM) z. B. 1630",
    "assignedTo": "Zuweisen an",
    "noAssignee": "Alle",
    "titleRequired": "Titel ist erforderlich.",
    "deleteConfirm": "Diese Aufgabe löschen?",
    "claim": "Übernehmen",
    "unclaim": "Zurückgeben",
    "requestDone": "Freigabe anfordern",
    "approve": "Genehmigen",
    "reject": "Ablehnen",
    "reset": "Zurücksetzen",
    "calendar": "Kalender",
    "datePlaceholder": "Datum wählen",
    "due": {
      "none": "Kein Termin"
    },
    "errors": {
      "actionFailed": "Aktion fehlgeschlagen.",
      "deleteFailed": "Löschen fehlgeschlagen.",
      "saveFailed": "Speichern fehlgeschlagen."
    },
    "repeat": {
      "auto": "Auto",
      "autoHint": "Automatisch abschließen ohne Freigabe",
      "autoOff": "Aus",
      "autoOn": "An",
      "days": "Alle ___ Tage wiederholen (nur Zahlen)",
      "none": "Nicht wiederholen",
      "label": "Wiederholen"
    },
    "today": "Heute",
    "tomorrow": "Morgen",
    "assignTo": "Zuweisen an",
    "assign": {
      "none": "Nicht zugewiesen"
    },
    "title": "Aufgaben",
    "heroSub": "Schnelle Filter & Übersicht",
    "new": "+ Neu",
    "newPrompt": "Was kannst du heute erledigen?",
    "when": "Wann?",
    "needsApproval": "Zur Freigabe",
    "nextDue": "Nächster Termin",
    "action": {
      "claim": "Übernehmen",
      "unclaim": "Zurückgeben",
      "requestDone": "Erledigt anfragen",
      "approve": "Freigeben",
      "reject": "Ablehnen",
      "doneAuto": "Erledigt"
    },
    "repeatEveryPlaceholder": "Alle ___ Tage wiederholen (nur Zahlen)",
    "dateInvalid": "Wähle ein gültiges Datum.",
    "timeInvalid": "Zeit muss HHMM sein (z. B. 1630).",
    "calendarMissing": "Kalenderauswahl nicht installiert. Gib TTMM ein; Kalender ist optional."
  },
  "today": {
    "title": "Heute",
    "familyPrefix": "Familie",
    "pills": {
      "total": "Gesamt",
      "open": "Aktiv",
      "done": "Erledigt"
    },
    "anytime": "Jederzeit",
    "morning": "Morgen",
    "afternoon": "Nachmittag",
    "evening": "Abend",
    "noTime": "Ohne Fälligkeit",
    "empty": {
      "title": "Keine Aufgaben heute",
      "subtitle": "Füge Aufgaben in Aufgaben hinzu und setze das Fälligkeitsdatum auf heute.",
      "active": "Alles erledigt 🎉",
      "done": "Heute keine erledigten Aufgaben",
      "switch": "Filter oben ändern oder Aufgaben in Aufgaben hinzufügen."
    }
  },
  "members": {
    "familyNameFallback": "Meine Familie",
    "editHint": "Zum Bearbeiten eines Mitglieds tippe ⋮ auf seiner Karte.",
    "filter": {
      "all": "Alle",
      "kids": "Kinder",
      "parents": "Eltern"
    },
    "kids": "Kinder",
    "listTitle": "Mitgliederliste",
    "noMembers": "Noch keine Mitglieder.",
    "parents": "Eltern",
    "stats": {
      "parents": "Eltern",
      "kids": "Kinder",
      "todayDone": "Heute erledigt"
    },
    "defaultParent": "Elternteil",
    "defaultChild": "Kind",
    "role": {
      "parent": "Elternteil",
      "child": "Kind"
    },
    "doneToday": "Heute erledigt"
  },
  "auth": {
    "missingUid": "Du bist nicht angemeldet (Mitglieds‑ID fehlt).",
    "invalidEmail": "Gib eine gültige E‑Mail ein.",
    "magicLinkSent": "Prüfe deine E‑Mail für den Anmelde‑Link.",
    "magicLinkHelp": "Wir schicken dir einen Anmelde‑Link per E‑Mail.",
    "loginMagicLink": "Anmelden (Magic Link)",
    "sendLink": "Link senden",
    "logout": "Abmelden",
    "signedInAs": "Angemeldet als:"
  },
  "home": {
    "anytimeTitle": "Jederzeit",
    "anytimeHint": "Kein Termin",
    "badge": {
      "attention": "ACHT"
    },
    "doneTitle": "Erledigt",
    "doneHint": "Kürzlich erledigt",
    "emptyTitle": "Keine Aufgaben",
    "emptySubtitle": "Füge Aufgaben hinzu, um zu starten.",
    "familyPrefix": "Familie",
    "filterPrefix": "Filter",
    "reviewTitle": "Zur Freigabe",
    "reviewHint": "Wartet auf deine Entscheidung",
    "reviewHintChild": "Wartet auf Eltern",
    "scope": {
      "family": "Familie",
      "kids": "Kinder",
      "me": "Ich"
    },
    "status": {
      "open": "Offen"
    },
    "subtitle": "Schnellübersicht",
    "tabAll": "Alle",
    "tabKids": "Kinder",
    "tabMe": "Ich",
    "tagline": "Familienaufgaben, ganz einfach",
    "todayHint": "Fokus",
    "todayTitle": "Heute",
    "upcomingHint": "Nächste 7 Tage",
    "upcomingTitle": "Bevorstehend",
    "stats": {
      "active": "Aktiv",
      "review": "Zur Freigabe",
      "done": "Erledigt"
    }
  },
  "shopping": {
    "addBtn": "Hinzufügen",
    "addPlaceholder": "Artikel hinzufügen…",
    "deleteBody": "Möchtest du diesen Artikel von der Liste entfernen?",
    "deleteTitle": "Artikel löschen",
    "emptyBody": "Füge Artikel über das Feld oben hinzu.",
    "emptyTitle": "Nichts zu kaufen",
    "errorTitle": "Einkauf",
    "me": "Ich",
    "member": "Mitglied",
    "noFamilyBody": "Tritt einer Familie bei oder erstelle eine, um die gemeinsame Einkaufsliste zu nutzen.",
    "noFamilyTitle": "Einkauf",
    "subtitle": "Gemeinsame Liste für die ganze Familie.",
    "suggestedBy": "Vorgeschlagen von",
    "toBuy": "Zu kaufen",
    "title": "Einkauf"
  }
};

const es = {
  "tabs": {
    "home": "Hoy",
    "members": "Miembros",
    "tasks": "Tareas",
    "settings": "Ajustes"
  },
  "common": {
    "loading": "Cargando...",
    "ok": "OK",
    "cancel": "Cancelar",
    "save": "Guardar",
    "error": "Error",
    "delete": "Eliminar",
    "copied": "Copiado.",
    "copyFailed": "No se pudo copiar.",
    "all": "Todos",
    "info": "Info",
    "me": "Yo"
  },
  "settings": {
    "title": "Ajustes",
    "subtitle": "Familia, idioma y perfil",
    "language": "Idioma",
    "languageHint": "Elige el idioma de la interfaz.",
    "languageNote": "Este cambio se aplica a toda la app.",
    "croatian": "Croata",
    "english": "Inglés",
    "italian": "Italiano",
    "slovenian": "Esloveno",
    "french": "Francés",
    "german": "Alemán",
    "spanish": "Español",
    "serbian": "Serbio",
    "family": {
      "notInFamily": "No estás en una familia.",
      "statusLine": "Familia: {{name}} (Invitación: {{code}})",
      "title": "Familia"
    },
    "about": "Acerca de",
    "account": "Cuenta",
    "aboutLine": "Aplicación familiar para tareas y organización.",
    "version": "Versión",
    "family_not_in_family": "No estás en una familia.",
    "btn": {
      "changeLanguage": "Cambiar idioma ({{lang}})",
      "editName": "Editar nombre",
      "copy": "Copiar",
      "renameFamily": "Renombrar"
    },
    "msg": {
      "familyRenamed": "Nombre de la familia actualizado."
    },
    "renameFamilyTitle": "Renombrar familia",
    "renameFamilyPlaceholder": "Nombre de la familia",
    "myName": "Mi nombre",
    "myNamePlaceholder": "Nombre",
    "nameRequired": "Introduce un nombre.",
    "saved": "Guardado.",
    "labels": {
      "family": "Familia",
      "inviteCode": "Código de invitación"
    }
  },
  "tasks": {
    "status": {
      "open": "Abierta",
      "claimed": "Asignada",
      "review": "Para aprobar",
      "done": "Hecha"
    },
    "filter": {
      "all": "Todas",
      "active": "Activas",
      "review": "Para aprobar",
      "done": "Hechas"
    },
    "hideDoneOn": "Ocultar hechas: ON",
    "hideDoneOff": "Ocultar hechas: OFF",
    "emptyTitle": "Sin tareas",
    "emptySubtitle": "Crea la primera tarea con + Nueva",
    "actionsTitle": "Acciones de la tarea",
    "edit": "Editar",
    "editTitle": "Editar tarea",
    "newTitle": "Nueva tarea",
    "titlePlaceholder": "p. ej. Recoger a los niños",
    "timePlaceholder": "Escribe (HHMM) p. ej. 1630",
    "assignedTo": "Asignar a",
    "noAssignee": "Todos",
    "titleRequired": "El título es obligatorio.",
    "deleteConfirm": "¿Eliminar esta tarea?",
    "claim": "Tomar",
    "unclaim": "Soltar",
    "requestDone": "Pedir aprobación",
    "approve": "Aprobar",
    "reject": "Rechazar",
    "reset": "Restablecer",
    "calendar": "Calendario",
    "datePlaceholder": "Elige una fecha",
    "due": {
      "none": "Sin fecha límite"
    },
    "errors": {
      "actionFailed": "La acción falló.",
      "deleteFailed": "No se pudo eliminar.",
      "saveFailed": "No se pudo guardar."
    },
    "repeat": {
      "auto": "Auto",
      "autoHint": "Completar automáticamente sin aprobación",
      "autoOff": "Desactivado",
      "autoOn": "Activado",
      "days": "Repetir cada ___ días (solo números)",
      "none": "No repetir",
      "label": "Repetir"
    },
    "today": "Hoy",
    "tomorrow": "Mañana",
    "assignTo": "Asignar a",
    "assign": {
      "none": "No asignado"
    },
    "title": "Tareas",
    "heroSub": "Filtros rápidos y vista general",
    "new": "+ Nueva",
    "newPrompt": "¿Qué puedes hacer hoy?",
    "when": "¿Cuándo?",
    "needsApproval": "Para aprobar",
    "nextDue": "Próximo vencimiento",
    "action": {
      "claim": "Tomar",
      "unclaim": "Devolver",
      "requestDone": "Solicitar finalización",
      "approve": "Aprobar",
      "reject": "Rechazar",
      "doneAuto": "Hecho"
    },
    "repeatEveryPlaceholder": "Repetir cada ___ días (solo números)",
    "dateInvalid": "Elige una fecha válida.",
    "timeInvalid": "La hora debe ser HHMM (p. ej. 1630).",
    "calendarMissing": "Selector de calendario no instalado. Introduce DDMM; el calendario es opcional."
  },
  "today": {
    "title": "Hoy",
    "familyPrefix": "Familia",
    "pills": {
      "total": "Total",
      "open": "Activas",
      "done": "Hechas"
    },
    "anytime": "En cualquier momento",
    "morning": "Mañana",
    "afternoon": "Tarde",
    "evening": "Noche",
    "noTime": "Sin fecha",
    "empty": {
      "title": "No hay tareas hoy",
      "subtitle": "Añade tareas en Tareas y pon la fecha límite para hoy.",
      "active": "¡Todo hecho! 🎉",
      "done": "No hay tareas completadas hoy",
      "switch": "Cambia el filtro arriba o añade tareas en Tareas."
    }
  },
  "members": {
    "familyNameFallback": "Mi familia",
    "editHint": "Para editar a un miembro, toca ⋮ en su tarjeta.",
    "filter": {
      "all": "Todos",
      "kids": "Niños",
      "parents": "Padres"
    },
    "kids": "Niños",
    "listTitle": "Lista de miembros",
    "noMembers": "Aún no hay miembros.",
    "parents": "Padres",
    "stats": {
      "parents": "Padres",
      "kids": "Niños",
      "todayDone": "Hecho hoy"
    },
    "defaultParent": "Padre/Madre",
    "defaultChild": "Niño",
    "role": {
      "parent": "Padre/Madre",
      "child": "Niño"
    },
    "doneToday": "Hecho hoy"
  },
  "auth": {
    "missingUid": "No has iniciado sesión (falta el ID del miembro).",
    "invalidEmail": "Introduce un correo válido.",
    "magicLinkSent": "Revisa tu correo para el enlace de inicio de sesión.",
    "magicLinkHelp": "Te enviaremos un enlace de inicio de sesión por correo.",
    "loginMagicLink": "Iniciar sesión (enlace mágico)",
    "sendLink": "Enviar enlace",
    "logout": "Cerrar sesión",
    "signedInAs": "Conectado como:"
  },
  "home": {
    "anytimeTitle": "En cualquier momento",
    "anytimeHint": "Sin fecha límite",
    "badge": {
      "attention": "ATEN"
    },
    "doneTitle": "Hecho",
    "doneHint": "Completado recientemente",
    "emptyTitle": "Sin tareas",
    "emptySubtitle": "Añade tareas para empezar.",
    "familyPrefix": "Familia",
    "filterPrefix": "Filtro",
    "reviewTitle": "Para aprobar",
    "reviewHint": "Esperando tu decisión",
    "reviewHintChild": "Esperando al padre",
    "scope": {
      "family": "Familia",
      "kids": "Niños",
      "me": "Yo"
    },
    "status": {
      "open": "Abierto"
    },
    "subtitle": "Vista rápida",
    "tabAll": "Todos",
    "tabKids": "Niños",
    "tabMe": "Yo",
    "tagline": "Tareas familiares, fáciles",
    "todayHint": "Enfoque",
    "todayTitle": "Hoy",
    "upcomingHint": "Próximos 7 días",
    "upcomingTitle": "Próximas",
    "stats": {
      "active": "Activas",
      "review": "Para aprobar",
      "done": "Hechas"
    }
  },
  "shopping": {
    "addBtn": "Añadir",
    "addPlaceholder": "Añadir un artículo…",
    "deleteBody": "¿Quieres quitar este artículo de la lista?",
    "deleteTitle": "Eliminar artículo",
    "emptyBody": "Añade artículos usando el campo de arriba.",
    "emptyTitle": "Nada que comprar",
    "errorTitle": "Compras",
    "me": "Yo",
    "member": "Miembro",
    "noFamilyBody": "Únete o crea una familia para usar la lista de compras compartida.",
    "noFamilyTitle": "Compras",
    "subtitle": "Lista compartida para toda la familia.",
    "suggestedBy": "Sugerido por",
    "toBuy": "Para comprar",
    "title": "Compras"
  }
};

const rs = {
  "tabs": {
    "home": "Danas",
    "members": "Članovi",
    "tasks": "Zadaci",
    "settings": "Podešavanja"
  },
  "common": {
    "loading": "Učitavam...",
    "ok": "U redu",
    "cancel": "Odustani",
    "save": "Sačuvaj",
    "error": "Greška",
    "delete": "Obriši",
    "copied": "Kopirano.",
    "copyFailed": "Ne mogu da kopiram.",
    "all": "Sve",
    "info": "Info",
    "me": "Ja"
  },
  "settings": {
    "title": "Podešavanja",
    "subtitle": "Porodica, jezik i profil",
    "language": "Jezik",
    "languageHint": "Izaberi jezik interfejsa.",
    "languageNote": "Ova promena važi za celu aplikaciju.",
    "croatian": "Hrvatski",
    "english": "Engleski",
    "italian": "Italijanski",
    "slovenian": "Slovenački",
    "french": "Francuski",
    "german": "Nemački",
    "spanish": "Španski",
    "serbian": "Srpski",
    "family": {
      "notInFamily": "Nisi u porodici.",
      "statusLine": "Porodica: {{name}} (Poziv: {{code}})",
      "title": "Porodica"
    },
    "about": "O aplikaciji",
    "account": "Nalog",
    "aboutLine": "Porodična aplikacija za zadatke i organizaciju.",
    "version": "Verzija",
    "family_not_in_family": "Nisi u porodici.",
    "btn": {
      "changeLanguage": "Promeni jezik ({{lang}})",
      "editName": "Uredi ime",
      "copy": "Kopiraj",
      "renameFamily": "Preimenuj"
    },
    "msg": {
      "familyRenamed": "Naziv porodice ažuriran."
    },
    "renameFamilyTitle": "Promeni naziv porodice",
    "renameFamilyPlaceholder": "Naziv porodice",
    "myName": "Moje ime",
    "myNamePlaceholder": "Ime",
    "nameRequired": "Unesi ime.",
    "saved": "Sačuvano.",
    "labels": {
      "family": "Porodica",
      "inviteCode": "Pozivni kod"
    }
  },
  "tasks": {
    "status": {
      "open": "Otvoren",
      "claimed": "Preuzet",
      "review": "Za potvrdu",
      "done": "Gotovo"
    },
    "filter": {
      "all": "Sve",
      "active": "Aktivno",
      "review": "Za potvrdu",
      "done": "Gotovo"
    },
    "hideDoneOn": "Sakrij gotovo: UKLJ",
    "hideDoneOff": "Sakrij gotovo: ISKLJ",
    "emptyTitle": "Nema zadataka",
    "emptySubtitle": "Kreiraj prvi zadatak sa + Novi",
    "actionsTitle": "Radnje zadatka",
    "edit": "Uredi",
    "editTitle": "Uredi zadatak",
    "newTitle": "Novi zadatak",
    "titlePlaceholder": "npr. Pokupi decu",
    "timePlaceholder": "Unesi (HHMM) npr. 1630",
    "assignedTo": "Dodeli",
    "noAssignee": "Svi",
    "titleRequired": "Naslov je obavezan.",
    "deleteConfirm": "Obrisati ovaj zadatak?",
    "claim": "Preuzmi",
    "unclaim": "Vrati",
    "requestDone": "Traži potvrdu",
    "approve": "Odobri",
    "reject": "Odbij",
    "reset": "Resetuj",
    "calendar": "Kalendar",
    "datePlaceholder": "Izaberi datum",
    "due": {
      "none": "Bez roka"
    },
    "errors": {
      "actionFailed": "Radnja nije uspela.",
      "deleteFailed": "Brisanje nije uspelo.",
      "saveFailed": "Čuvanje nije uspelo."
    },
    "repeat": {
      "auto": "Auto",
      "autoHint": "Automatski završi bez potvrde",
      "autoOff": "Isključeno",
      "autoOn": "Uključeno",
      "days": "Ponavljaj na ___ dana (samo brojevi)",
      "none": "Ne ponavljaj",
      "label": "Ponavljanje"
    },
    "today": "Danas",
    "tomorrow": "Sutra",
    "assignTo": "Dodeli",
    "assign": {
      "none": "Nije dodeljeno"
    },
    "title": "Zadaci",
    "heroSub": "Brzi filteri i pregled",
    "new": "+ Novi",
    "newPrompt": "Šta možeš danas da uradiš?",
    "when": "Kada?",
    "needsApproval": "Za potvrdu",
    "nextDue": "Sledeći rok",
    "action": {
      "claim": "Preuzmi",
      "unclaim": "Vrati",
      "requestDone": "Zahtevaj potvrdu",
      "approve": "Odobri",
      "reject": "Odbij",
      "doneAuto": "Urađeno"
    },
    "repeatEveryPlaceholder": "Ponavljaj na ___ dana (samo brojevi)",
    "dateInvalid": "Izaberi ispravan datum.",
    "timeInvalid": "Vreme mora biti HHMM (npr. 1630).",
    "calendarMissing": "Izbor kalendara nije instaliran. Unesi DDMM; kalendar je opcion."
  },
  "today": {
    "title": "Danas",
    "familyPrefix": "Porodica",
    "pills": {
      "total": "Ukupno",
      "open": "Aktivno",
      "done": "Gotovo"
    },
    "anytime": "Bilo kada",
    "morning": "Jutro",
    "afternoon": "Popodne",
    "evening": "Veče",
    "noTime": "Bez roka",
    "empty": {
      "title": "Danas nema zadataka",
      "subtitle": "Dodaj zadatke u Zadaci i postavi rok za danas.",
      "active": "Sve je gotovo 🎉",
      "done": "Danas nema završenih zadataka",
      "switch": "Promeni filter gore ili dodaj nove zadatke u Zadaci."
    }
  },
  "members": {
    "familyNameFallback": "Moja porodica",
    "editHint": "Za uređivanje člana, dodirni ⋮ na njegovoj kartici.",
    "filter": {
      "all": "Sve",
      "kids": "Deca",
      "parents": "Roditelji"
    },
    "kids": "Deca",
    "listTitle": "Spisak članova",
    "noMembers": "Još nema članova.",
    "parents": "Roditelji",
    "stats": {
      "parents": "Roditelji",
      "kids": "Deca",
      "todayDone": "Danas urađeno"
    },
    "defaultParent": "Roditelj",
    "defaultChild": "Dete",
    "role": {
      "parent": "Roditelj",
      "child": "Dete"
    },
    "doneToday": "Danas urađeno"
  },
  "auth": {
    "missingUid": "Nisi prijavljen (nedostaje ID člana).",
    "invalidEmail": "Unesi ispravan email.",
    "magicLinkSent": "Proveri email za link za prijavu.",
    "magicLinkHelp": "Poslaćemo ti link za prijavu na email.",
    "loginMagicLink": "Prijava (magic link)",
    "sendLink": "Pošalji link",
    "logout": "Odjava",
    "signedInAs": "Prijavljen kao:"
  },
  "home": {
    "anytimeTitle": "Bilo kada",
    "anytimeHint": "Bez roka",
    "badge": {
      "attention": "PAŽNJA"
    },
    "doneTitle": "Urađeno",
    "doneHint": "Nedavno završeno",
    "emptyTitle": "Nema zadataka",
    "emptySubtitle": "Dodaj zadatke da kreneš.",
    "familyPrefix": "Porodica",
    "filterPrefix": "Filter",
    "reviewTitle": "Za potvrdu",
    "reviewHint": "Čeka tvoju odluku",
    "reviewHintChild": "Čeka roditelja",
    "scope": {
      "family": "Porodica",
      "kids": "Deca",
      "me": "Ja"
    },
    "status": {
      "open": "Otvoreno"
    },
    "subtitle": "Brzi pregled",
    "tabAll": "Sve",
    "tabKids": "Deca",
    "tabMe": "Ja",
    "tagline": "Porodični zadaci, jednostavno",
    "todayHint": "Fokus",
    "todayTitle": "Danas",
    "upcomingHint": "Sledećih 7 dana",
    "upcomingTitle": "Nadolazeće",
    "stats": {
      "active": "Aktivno",
      "review": "Za potvrdu",
      "done": "Urađeno"
    }
  },
  "shopping": {
    "addBtn": "Dodaj",
    "addPlaceholder": "Dodaj stavku…",
    "deleteBody": "Da li želiš da ukloniš ovu stavku sa liste?",
    "deleteTitle": "Obriši stavku",
    "emptyBody": "Dodaj stavke koristeći polje iznad.",
    "emptyTitle": "Nema šta da se kupi",
    "errorTitle": "Kupovina",
    "me": "Ja",
    "member": "Član",
    "noFamilyBody": "Pridruži se ili napravi porodicu da koristiš zajedničku listu za kupovinu.",
    "noFamilyTitle": "Kupovina",
    "subtitle": "Zajednička lista za celu porodicu.",
    "suggestedBy": "Predložio",
    "toBuy": "Za kupiti",
    "title": "Kupovina"
  }
};

export const i18n = new I18n({ en, hr, it, sl, fr, de, es, rs });
i18n.enableFallback = true;

i18n.defaultLocale = "en";
i18n.locale = "hr";

export async function getStoredLocale(): Promise<AppLocale | null> {
  try {
    const v = await AsyncStorage.getItem(LOCALE_KEY);
    if (!v) return null;
    if (v === "en" || v === "hr" || v === "it" || v === "sl" || v === "fr" || v === "de" || v === "es" || v === "rs") return v;
    return null;
  } catch {
    return null;
  }
}

export async function persistLocale(locale: AppLocale) {
  try { await AsyncStorage.setItem(LOCALE_KEY, locale); } catch {}
}

export function applyLocale(locale: AppLocale) { i18n.locale = locale; }