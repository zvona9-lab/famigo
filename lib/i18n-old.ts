// /lib/i18n.ts
import { I18n } from "i18n-js";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type AppLocale = "en" | "hr" | "it" | "sl" | "fr" | "de" | "es" | "rs";
const LOCALE_KEY = "famigo.locale";

/**
 * ✅ VAŽNO:
 * - en je baza
 * - hr je default
 * - ostali jezici su sada kompletno prevedeni
 */

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
    "copyFailed": "Could not copy."
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
      "statusLine": "Family: {{name}} (Invite: {{code}})"
    },
    "about": "About",
    "account": "Account",
    "aboutLine": "Family app for tasks and organization.",
    "version": "Version",
    "family_not_in_family": "You are not in a family.",
    "btn": {
      "changeLanguage": "Change language ({{lang}})",
      "editName": "Edit name",
      "copy": "Copy"
    },
    "msg": {
      "familyRenamed": "Family name updated."
    },
    "renameFamilyTitle": "Rename family",
    "renameFamilyPlaceholder": "Family name"
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
    "calendarMissing": "Calendar picker not installed. Enter DDMM; calendar is optional."
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
    "familyNameFallback": "My Family"
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
    "copyFailed": "Ne mogu kopirati."
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
      "statusLine": "Obitelj: {{name}} (Poziv: {{code}})"
    },
    "about": "O aplikaciji",
    "account": "Račun",
    "aboutLine": "Obiteljska aplikacija za zadatke i organizaciju.",
    "version": "Verzija",
    "family_not_in_family": "Nisi u obitelji.",
    "btn": {
      "changeLanguage": "Promijeni jezik ({{lang}})",
      "editName": "Uredi ime",
      "copy": "Kopiraj"
    },
    "msg": {
      "familyRenamed": "Naziv obitelji ažuriran."
    },
    "renameFamilyTitle": "Promijeni naziv obitelji",
    "renameFamilyPlaceholder": "Naziv obitelji"
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
    "calendarMissing": "Kalendar nije instaliran. Unesi DDMM; kalendar je opcionalan."
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
    "familyNameFallback": "Moja obitelj"
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
    "copyFailed": "Impossibile copiare."
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
      "statusLine": "Famiglia: {{name}} (Invito: {{code}})"
    },
    "about": "Info",
    "account": "Account",
    "aboutLine": "App familiare per attività e organizzazione.",
    "version": "Versione",
    "family_not_in_family": "Non sei in una famiglia.",
    "btn": {
      "changeLanguage": "Cambia lingua ({{lang}})",
      "editName": "Modifica nome",
      "copy": "Copia"
    },
    "msg": {
      "familyRenamed": "Nome famiglia aggiornato."
    },
    "renameFamilyTitle": "Rinomina famiglia",
    "renameFamilyPlaceholder": "Nome famiglia",
    "myName": "Il mio nome",
    "myNamePlaceholder": "Nome",
    "nameRequired": "Inserisci un nome.",
    "saved": "Salvato."
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
    "reset": "Reimposta"
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
    "familyNameFallback": "La mia famiglia"
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
    "copyFailed": "Ni mogoče kopirati."
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
      "statusLine": "Družina: {{name}} (Vabilo: {{code}})"
    },
    "about": "O aplikaciji",
    "account": "Račun",
    "aboutLine": "Družinska aplikacija za opravila in organizacijo.",
    "version": "Različica",
    "family_not_in_family": "Nisi v družini.",
    "btn": {
      "changeLanguage": "Zamenjaj jezik ({{lang}})",
      "editName": "Uredi ime",
      "copy": "Kopiraj"
    },
    "msg": {
      "familyRenamed": "Ime družine posodobljeno."
    },
    "renameFamilyTitle": "Preimenuj družino",
    "renameFamilyPlaceholder": "Ime družine",
    "myName": "Moje ime",
    "myNamePlaceholder": "Ime",
    "nameRequired": "Vnesi ime.",
    "saved": "Shranjeno."
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
    "reset": "Ponastavi"
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
    "familyNameFallback": "Moja družina"
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
    "copyFailed": "Impossible de copier."
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
      "statusLine": "Famille : {{name}} (Invitation : {{code}})"
    },
    "about": "À propos",
    "account": "Compte",
    "aboutLine": "Application familiale pour les tâches et l’organisation.",
    "version": "Version",
    "family_not_in_family": "Vous n’êtes pas dans une famille.",
    "btn": {
      "changeLanguage": "Changer la langue ({{lang}})",
      "editName": "Modifier le nom",
      "copy": "Copier"
    },
    "msg": {
      "familyRenamed": "Nom de la famille mis à jour."
    },
    "renameFamilyTitle": "Renommer la famille",
    "renameFamilyPlaceholder": "Nom de la famille",
    "myName": "Mon nom",
    "myNamePlaceholder": "Nom",
    "nameRequired": "Veuillez saisir un nom.",
    "saved": "Enregistré."
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
    "reset": "Réinitialiser"
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
    "familyNameFallback": "Ma famille"
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
    "copyFailed": "Kopieren nicht möglich."
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
      "statusLine": "Familie: {{name}} (Einladung: {{code}})"
    },
    "about": "Über",
    "account": "Konto",
    "aboutLine": "Familien‑App für Aufgaben und Organisation.",
    "version": "Version",
    "family_not_in_family": "Du bist in keiner Familie.",
    "btn": {
      "changeLanguage": "Sprache ändern ({{lang}})",
      "editName": "Name bearbeiten",
      "copy": "Kopieren"
    },
    "msg": {
      "familyRenamed": "Familienname aktualisiert."
    },
    "renameFamilyTitle": "Familie umbenennen",
    "renameFamilyPlaceholder": "Familienname",
    "myName": "Mein Name",
    "myNamePlaceholder": "Name",
    "nameRequired": "Bitte einen Namen eingeben.",
    "saved": "Gespeichert."
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
    "reset": "Zurücksetzen"
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
    "familyNameFallback": "Meine Familie"
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
    "copyFailed": "No se pudo copiar."
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
      "statusLine": "Familia: {{name}} (Invitación: {{code}})"
    },
    "about": "Acerca de",
    "account": "Cuenta",
    "aboutLine": "Aplicación familiar para tareas y organización.",
    "version": "Versión",
    "family_not_in_family": "No estás en una familia.",
    "btn": {
      "changeLanguage": "Cambiar idioma ({{lang}})",
      "editName": "Editar nombre",
      "copy": "Copiar"
    },
    "msg": {
      "familyRenamed": "Nombre de la familia actualizado."
    },
    "renameFamilyTitle": "Renombrar familia",
    "renameFamilyPlaceholder": "Nombre de la familia",
    "myName": "Mi nombre",
    "myNamePlaceholder": "Nombre",
    "nameRequired": "Introduce un nombre.",
    "saved": "Guardado."
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
    "reset": "Restablecer"
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
    "familyNameFallback": "Mi familia"
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
    "copyFailed": "Ne mogu da kopiram."
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
      "statusLine": "Porodica: {{name}} (Poziv: {{code}})"
    },
    "about": "O aplikaciji",
    "account": "Nalog",
    "aboutLine": "Porodična aplikacija za zadatke i organizaciju.",
    "version": "Verzija",
    "family_not_in_family": "Nisi u porodici.",
    "btn": {
      "changeLanguage": "Promeni jezik ({{lang}})",
      "editName": "Uredi ime",
      "copy": "Kopiraj"
    },
    "msg": {
      "familyRenamed": "Naziv porodice ažuriran."
    },
    "renameFamilyTitle": "Promeni naziv porodice",
    "renameFamilyPlaceholder": "Naziv porodice",
    "myName": "Moje ime",
    "myNamePlaceholder": "Ime",
    "nameRequired": "Unesi ime.",
    "saved": "Sačuvano."
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
    "reset": "Resetuj"
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
    "familyNameFallback": "Moja porodica"
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
  }
};

export const i18n = new I18n({
  en,
  hr,
  it,
  sl,
  fr,
  de,
  es,
  rs,
});

i18n.enableFallback = true;
i18n.defaultLocale = "en";

export async function getStoredLocale(): Promise<AppLocale | null> {
  try {
    const v = (await AsyncStorage.getItem(LOCALE_KEY)) as AppLocale | null;
    return v ?? null;
  } catch {
    return null;
  }
}

export async function persistLocale(locale: AppLocale) {
  try {
    await AsyncStorage.setItem(LOCALE_KEY, locale);
  } catch {}
}

export function applyLocale(locale: AppLocale) {
  i18n.locale = locale;
}
