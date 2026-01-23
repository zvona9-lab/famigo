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
    "settings": "Settings",
    "shopping": "Shopping"
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
    "all": "All",
    "on": "On",
    "off": "Off",
    "success": "Success"
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
      "title": "Family",
      "nextStepTitle": "Next step",
      "nextStepBody": "Please set your name so others can recognize you.",
      "notInFamilyTitle": "No family yet"
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
      "renameFamily": "Rename",
      "setYourName": "Set your name",
      "leaveFamily": "Leave family",
      "deleteFamily": "Delete family",
      "showInviteCode": "Show invite code",
      "setName": "Set your name",
      "hideInviteCode": "Hide invite code",
      "createFamily": "Create family",
      "joinFamily": "Join family",
      "join": "Join"
    },
    "msg": {
      "familyRenamed": "Family name updated."
    },
    "renameFamilyTitle": "Rename family",
    "renameFamilyPlaceholder": "Family name",
    "labels": {
      "family": "Family",
      "inviteCode": "Invite code",
      "yourName": "Your name",
      "myName": "Your name"
    },
    "notSet": "Not set",
    "onlyMemberDeleteHint": "You can delete the family only when you are the only member.",
    "nameAfterJoin": "Join or create a family to set your name.",
    "joinFamily": {
      "help": "Enter an invite code from a family member.",
      "title": "Join family",
      "placeholder": "Invite code",
      "invalidCode": "Enter invite code.",
      "joined": "You are now in the family."
    },
    "createFamily": {
      "title": "Create family",
      "desc": "Create a new family and invite others.",
      "placeholder": "Family name",
      "nameRequired": "Enter a family name.",
      "created": "Family created."
    },
    "deleteFamily": {
      "title": "Delete family",
      "body": "This will delete the family and all its data. This cannot be undone.",
      "confirm": "Delete",
      "deleted": "Family deleted.",
      "help": "You can delete the family only when you are the only member."
    },
    "setup": {
      "title": "Set up your account",
      "step1": "1) Join or create a family",
      "step2": "2) Then set your name in Settings → Family",
      "whyName": "Your name is stored as a family member, so it becomes available after you join a family.",
      "next": "Next step",
      "setNameNow": "Please set your name so others can recognize you."
    },
    "leaveFamily": {
      "title": "Leave family",
      "body": "Are you sure you want to leave the family?",
      "confirm": "Leave",
      "left": "You left the family."
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
      "none": "Not assigned",
      "select": "Select",
      "clear": "Clear selection"
    },
    "assignTo": "Assign to",
    "repeat": {
      "autoHint": "Auto complete without approval",
      "autoOn": "Auto (no approval):  ON",
      "none": "Off",
      "auto": "Auto",
      "autoOff": "Auto (no approval):  OFF",
      "label": "Repeat",
      "days": "Repeat every ___ days (numbers only)"
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
    "today": "Today",
    "repeatFor": "Repeat tasks for",
    "repeatDaysPlaceholder": "___"
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
      "parents": "Parents",
      "todayDone": "Done today"
    },
    "doneToday": "Done today",
    "listTitle": "Members list",
    "noMembers": "No members yet.",
    "filter": {
      "all": "All",
      "parents": "Parents",
      "kids": "Kids"
    },
    "parents": "Parents",
    "kids": "Kids",
    "noFamilyTitle": "You are not in a family yet.",
    "noFamilyBody": "Join or create a family in Settings → Family.",
    "countLine": "{{n}} members",
    "actions": {
      "subtitle": "Edit member",
      "roleTitle": "Role",
      "rename": "Rename",
      "remove": "Remove"
    },
    "rename": {
      "title": "Rename",
      "placeholder": "New name"
    },
    "lastParent": {
      "cantChangeRole": "You cannot change the role of the last parent. Add another parent first.",
      "cantRemove": "You cannot remove the last parent. Add another parent first.",
      "notice": "This is the last parent, so you cannot change their role or remove them."
    },
    "remove": {
      "title": "Remove member?",
      "body": "Tasks remain, but the member is removed and any assignments to them are cleared."
    },
    "fallbackMember": "Member",
    "changeOwnNameHint": "Change your own name in Settings → Family.",
    "memberFallback": "Member",
    "editMember": "Edit member",
    "roleTitle": "Role",
    "lastParentNotice": "This is the last parent, so you cannot change their role or remove them.",
    "removeTitle": "Remove member?",
    "removeBody": "Tasks remain, but the member is removed and any assignments to them are cleared.",
    "count": "{{n}} members",
    "newNamePlaceholder": "New name"
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
    },
    "bought7days": "Bought (7 days)",
    "bought7d": "Bought (7 days)",
    "bought": "Bought",
    "boughtEmptyTitle": "No recent purchases",
    "boughtEmptyBody": "Items bought in the last 7 days will show here.",
    "addedBy": "Added by",
    "addedAt": "Added",
    "boughtWhen": "Bought"
  },
  "home": {
    "anytimeHint": "No due date",
    "scope": {
      "family": "Family",
      "kids": "Kids",
      "me": "Me"
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
    "subtitle": "Quick overview",
    "status": {
      "open": "Open"
    },
    "tabAll": "All",
    "tabKids": "Kids",
    "tabMe": "Me",
    "brandTitle": "FamiGo",
    "scopeHint": {
      "me": "Tasks that are for you",
      "kids": "Tasks for all kids",
      "family": "All family tasks"
    },
    "info": {
      "scope": {
        "title": "Views",
        "body": "Choose whose tasks to show: Family, Kids, or Me."
      },
      "review": {
        "title": "Waiting for approval",
        "body": {
          "parent": "Approve or reject tasks requested as done.",
          "child": "When you request done, a parent needs to approve it."
        }
      },
      "actions": {
        "title": "Buttons",
        "open": "Claim — take the task for yourself.",
        "claimed": "Request done — ask a parent to approve completion.",
        "review": {
          "parent": "Approve / Reject — decide if the task is done.",
          "child": "Waiting — a parent will approve or reject."
        }
      }
    }
  }
};

const hr = {
  "tabs": {
    "home": "Danas",
    "members": "Članovi",
    "tasks": "Zadaci",
    "settings": "Postavke",
    "shopping": "Kupovina"
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
    "me": "Ja",
    "on": "UKLJ",
    "off": "ISKLJ",
    "success": "Uspjeh"
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
      "title": "Obitelj",
      "nextStepTitle": "Sljedeći korak",
      "nextStepBody": "Postavi svoje ime kako bi te drugi mogli prepoznati.",
      "notInFamilyTitle": "Još nema obitelji"
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
      "renameFamily": "Preimenuj",
      "setYourName": "Postavi ime",
      "leaveFamily": "Napusti obitelj",
      "deleteFamily": "Obriši obitelj",
      "showInviteCode": "Prikaži pozivni kod",
      "setName": "Postavi ime",
      "hideInviteCode": "Sakrij pozivni kod",
      "createFamily": "Napravi obitelj",
      "joinFamily": "Pridruži se obitelji",
      "join": "Pridruži se"
    },
    "msg": {
      "familyRenamed": "Naziv obitelji ažuriran."
    },
    "renameFamilyTitle": "Promijeni naziv obitelji",
    "renameFamilyPlaceholder": "Naziv obitelji",
    "labels": {
      "family": "Obitelj",
      "inviteCode": "Pozivni kod",
      "yourName": "Tvoje ime",
      "myName": "Tvoje ime"
    },
    "notSet": "Nije postavljeno",
    "onlyMemberDeleteHint": "Obitelj možeš obrisati samo ako si jedini član.",
    "nameAfterJoin": "Pridruži se ili napravi obitelj da postaviš ime.",
    "joinFamily": {
      "help": "Upiši pozivni kod koji ti je poslao član obitelji.",
      "title": "Pridruži se obitelji",
      "placeholder": "Pozivni kod",
      "invalidCode": "Upiši pozivni kod.",
      "joined": "Sada si u obitelji."
    },
    "createFamily": {
      "title": "Napravi obitelj",
      "desc": "Napravi novu obitelj i pozovi ostale.",
      "placeholder": "Naziv obitelji",
      "nameRequired": "Upiši naziv obitelji.",
      "created": "Obitelj je kreirana."
    },
    "deleteFamily": {
      "title": "Obriši obitelj",
      "body": "Ovo će obrisati obitelj i sve podatke. Ne može se poništiti.",
      "confirm": "Obriši",
      "deleted": "Obitelj obrisana.",
      "help": "Obitelj možeš obrisati samo ako si jedini član."
    },
    "setup": {
      "title": "Postavi račun",
      "step1": "1) Pridruži se ili napravi obitelj",
      "step2": "2) Zatim postavi ime u Postavke → Obitelj",
      "whyName": "Ime se sprema kao član obitelji, pa je dostupno nakon što se pridružiš obitelji.",
      "next": "Sljedeći korak",
      "setNameNow": "Postavi svoje ime kako bi te drugi mogli prepoznati."
    },
    "leaveFamily": {
      "title": "Napusti obitelj",
      "body": "Jesi li siguran/na da želiš napustiti obitelj?",
      "confirm": "Napusti",
      "left": "Napustio/la si obitelj."
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
      "none": "Ne ponavljaj",
      "label": "Ponavljanje",
      "days": "dana"
    },
    "today": "Danas",
    "tomorrow": "Sutra",
    "assignTo": "Dodijeli",
    "assign": {
      "none": "Nije dodijeljeno",
      "select": "Odaberi",
      "clear": "Očisti odabir"
    },
    "repeatFor": "Ponavljaj zadatak",
    "repeatDaysPlaceholder": "___"
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
    "doneToday": "Danas riješeno",
    "noFamilyTitle": "Nisi još u obitelji.",
    "noFamilyBody": "Uđi u obitelj u Postavke → Obitelj.",
    "countLine": "{{n}} članova",
    "actions": {
      "subtitle": "Uredi člana",
      "roleTitle": "Uloga",
      "rename": "Preimenuj",
      "remove": "Obriši"
    },
    "rename": {
      "title": "Preimenuj",
      "placeholder": "Novo ime"
    },
    "lastParent": {
      "cantChangeRole": "Ne možeš promijeniti ulogu zadnjeg roditelja. Dodaj još jednog roditelja pa pokušaj opet.",
      "cantRemove": "Ne možeš obrisati zadnjeg roditelja. Dodaj još jednog roditelja pa pokušaj opet.",
      "notice": "Ovo je zadnji roditelj pa mu ne možeš promijeniti ulogu niti ga obrisati."
    },
    "remove": {
      "title": "Obrisati člana?",
      "body": "Zadaci ostaju, ali se uklanja član i sve dodjele tom članu."
    },
    "fallbackMember": "Član",
    "changeOwnNameHint": "Svoje ime mijenjaš u Postavke → Obitelj.",
    "memberFallback": "Član",
    "editMember": "Uredi člana",
    "roleTitle": "Uloga",
    "lastParentNotice": "Ovo je zadnji roditelj pa mu ne možeš promijeniti ulogu niti ga obrisati.",
    "removeTitle": "Obrisati člana?",
    "removeBody": "Zadaci ostaju, ali se uklanja član i sve dodjele tom članu.",
    "count": "{{n}} članova",
    "newNamePlaceholder": "Novo ime"
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
    },
    "bought7days": "Kupljeno (7 dana)",
    "bought7d": "Kupljeno (7 dana)",
    "bought": "Kupljeno",
    "boughtEmptyTitle": "Nema nedavnih kupovina",
    "boughtEmptyBody": "Stavke kupljene u zadnjih 7 dana prikazat će se ovdje.",
    "addedBy": "Dodao/la",
    "addedAt": "Dodano",
    "boughtWhen": "Kupljeno"
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
    },
    "brandTitle": "FamiGo",
    "scopeHint": {
      "me": "Zadaci koji su za tebe",
      "kids": "Zadaci za svu djecu",
      "family": "Svi obiteljski zadaci"
    },
    "info": {
      "scope": {
        "title": "Prikazi",
        "body": "Odaberi čije zadatke prikazati: Obitelj, Djeca ili Ja."
      },
      "review": {
        "title": "Čeka potvrdu",
        "body": {
          "parent": "Odobri ili odbij zadatke za koje je zatražena potvrda.",
          "child": "Kad zatražiš potvrdu, roditelj to treba odobriti."
        }
      },
      "actions": {
        "title": "Gumbi",
        "open": "Preuzmi — uzmi zadatak za sebe.",
        "claimed": "Traži potvrdu — zatraži od roditelja da odobri završetak.",
        "review": {
          "parent": "Odobri / Odbij — odluči je li zadatak gotov.",
          "child": "Čekanje — roditelj će odobriti ili odbiti."
        }
      }
    }
  }
};

const it = {
  "tabs": {
    "home": "Oggi",
    "members": "Membri",
    "tasks": "Attività",
    "settings": "Impostazioni",
    "shopping": "Spesa"
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
    "me": "Io",
    "on": "On",
    "off": "Off",
    "success": "Successo"
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
      "title": "Famiglia",
      "nextStepTitle": "Prossimo passo",
      "nextStepBody": "Imposta il tuo nome così gli altri possono riconoscerti.",
      "notInFamilyTitle": "Nessuna famiglia"
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
      "renameFamily": "Rinomina",
      "setYourName": "Imposta il tuo nome",
      "leaveFamily": "Lascia la famiglia",
      "deleteFamily": "Elimina famiglia",
      "showInviteCode": "Mostra codice invito",
      "setName": "Imposta il tuo nome",
      "hideInviteCode": "Nascondi codice invito",
      "createFamily": "Crea famiglia",
      "joinFamily": "Unisciti alla famiglia",
      "join": "Unisciti"
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
      "inviteCode": "Codice invito",
      "yourName": "Il tuo nome",
      "myName": "Il tuo nome"
    },
    "notSet": "Non impostato",
    "onlyMemberDeleteHint": "Puoi eliminare la famiglia solo se sei l'unico membro.",
    "nameAfterJoin": "Unisciti o crea una famiglia per impostare il tuo nome.",
    "joinFamily": {
      "help": "Inserisci un codice invito da un membro della famiglia.",
      "title": "Unisciti alla famiglia",
      "placeholder": "Codice invito",
      "invalidCode": "Inserisci il codice invito.",
      "joined": "Ora sei nella famiglia."
    },
    "createFamily": {
      "title": "Crea famiglia",
      "desc": "Crea una nuova famiglia e invita gli altri.",
      "placeholder": "Nome famiglia",
      "nameRequired": "Inserisci un nome famiglia.",
      "created": "Famiglia creata."
    },
    "deleteFamily": {
      "title": "Elimina famiglia",
      "body": "Questo eliminerà la famiglia e tutti i dati. Non può essere annullato.",
      "confirm": "Elimina",
      "deleted": "Famiglia eliminata.",
      "help": "Puoi eliminare la famiglia solo se sei l'unico membro."
    },
    "setup": {
      "title": "Configura il tuo account",
      "step1": "1) Unisciti o crea una famiglia",
      "step2": "2) Poi imposta il tuo nome in Impostazioni → Famiglia",
      "whyName": "Il nome è salvato come membro della famiglia, quindi è disponibile dopo l’adesione.",
      "next": "Prossimo passo",
      "setNameNow": "Imposta il tuo nome così gli altri possono riconoscerti."
    },
    "leaveFamily": {
      "title": "Lascia la famiglia",
      "body": "Sei sicuro di voler lasciare la famiglia?",
      "confirm": "Lascia",
      "left": "Hai lasciato la famiglia."
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
      "days": "giorni",
      "none": "Non ripetere",
      "label": "Ripeti"
    },
    "today": "Oggi",
    "tomorrow": "Domani",
    "assignTo": "Assegna a",
    "assign": {
      "none": "Non assegnato",
      "select": "Seleziona",
      "clear": "Cancella selezione"
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
    "calendarMissing": "Selettore calendario non installato. Inserisci GGMM; il calendario è opzionale.",
    "active": "Attivi",
    "done": "Fatti",
    "review": "Da approvare",
    "selectedDate": "Data selezionata",
    "dateNotSet": "—",
    "repeatFor": "Ripeti attività per",
    "repeatDaysPlaceholder": "___"
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
    "doneToday": "Fatto oggi",
    "noFamilyTitle": "Non sei ancora in una famiglia.",
    "noFamilyBody": "Unisciti/crea una famiglia in Impostazioni → Famiglia.",
    "countLine": "{{n}} membri",
    "actions": {
      "subtitle": "Modifica membro",
      "roleTitle": "Ruolo",
      "rename": "Rinomina",
      "remove": "Rimuovi"
    },
    "rename": {
      "title": "Rinomina",
      "placeholder": "Nuovo nome"
    },
    "lastParent": {
      "cantChangeRole": "Non puoi cambiare il ruolo dell’ultimo genitore. Aggiungi prima un altro genitore.",
      "cantRemove": "Non puoi rimuovere l’ultimo genitore. Aggiungi prima un altro genitore.",
      "notice": "Questo è l’ultimo genitore, quindi non puoi cambiarne il ruolo né rimuoverlo."
    },
    "remove": {
      "title": "Rimuovere il membro?",
      "body": "Le attività restano, ma il membro viene rimosso e le assegnazioni vengono cancellate."
    },
    "fallbackMember": "Membro",
    "changeOwnNameHint": "Cambia il tuo nome in Impostazioni → Famiglia.",
    "memberFallback": "Membro",
    "editMember": "Modifica membro",
    "roleTitle": "Ruolo",
    "lastParentNotice": "Questo è l'ultimo genitore, quindi non puoi cambiare il ruolo né rimuoverlo.",
    "removeTitle": "Rimuovere membro?",
    "removeBody": "Le attività restano, ma il membro viene rimosso e le assegnazioni vengono cancellate.",
    "count": "{{n}} membri",
    "newNamePlaceholder": "Nuovo nome"
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
    },
    "brandTitle": "FamiGo",
    "scopeHint": {
      "me": "Attività per te",
      "kids": "Attività per tutti i bambini",
      "family": "Tutte le attività di famiglia"
    },
    "info": {
      "scope": {
        "title": "Viste",
        "body": "Scegli quali attività mostrare: Famiglia, Bambini o Io."
      },
      "review": {
        "title": "In attesa di approvazione",
        "body": {
          "parent": "Approva o rifiuta le attività segnate come completate.",
          "child": "Quando richiedi completamento, un genitore deve approvarlo."
        }
      },
      "actions": {
        "title": "Pulsanti",
        "open": "Prendi — assegna l’attività a te.",
        "claimed": "Richiedi conferma — chiedi a un genitore di approvare.",
        "review": {
          "parent": "Approva / Rifiuta — decidi se l’attività è fatta.",
          "child": "In attesa — un genitore approverà o rifiuterà."
        }
      }
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
    "title": "Spesa",
    "chip": {
      "detergent": "Detersivo per bucato",
      "toiletPaper": "Carta igienica",
      "water": "Acqua",
      "milk": "Latte",
      "bread": "Pane",
      "eggs": "Uova",
      "fruit": "Frutta",
      "vegetables": "Verdure",
      "meat": "Carne",
      "cheese": "Formaggio",
      "shampoo": "Shampoo",
      "dishSoap": "Detersivo per piatti"
    },
    "bought7days": "Comprato (7 giorni)",
    "bought7d": "Comprato (7 giorni)",
    "bought": "Comprato",
    "boughtEmptyTitle": "Nessun acquisto recente",
    "boughtEmptyBody": "Gli articoli comprati negli ultimi 7 giorni appariranno qui.",
    "addedBy": "Aggiunto da",
    "addedAt": "Aggiunto",
    "boughtWhen": "Comprato"
  }
};

const sl = {
  "tabs": {
    "home": "Danes",
    "members": "Člani",
    "tasks": "Opravila",
    "settings": "Nastavitve",
    "shopping": "Nakupovanje"
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
    "me": "Jaz",
    "on": "Vklop",
    "off": "Izklop",
    "success": "Uspeh"
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
      "title": "Družina",
      "nextStepTitle": "Naslednji korak",
      "nextStepBody": "Nastavi svoje ime, da te bodo drugi prepoznali.",
      "notInFamilyTitle": "Še ni družine"
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
      "renameFamily": "Preimenuj",
      "setYourName": "Nastavi svoje ime",
      "leaveFamily": "Zapusti družino",
      "deleteFamily": "Izbriši družino",
      "showInviteCode": "Prikaži kodo povabila",
      "setName": "Nastavi svoje ime",
      "hideInviteCode": "Skrij kodo vabila",
      "createFamily": "Ustvari družino",
      "joinFamily": "Pridruži se družini",
      "join": "Pridruži se"
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
      "inviteCode": "Vabilna koda",
      "yourName": "Tvoje ime",
      "myName": "Tvoje ime"
    },
    "notSet": "Ni nastavljeno",
    "onlyMemberDeleteHint": "Družino lahko izbrišeš samo, če si edini član.",
    "nameAfterJoin": "Pridruži se ali ustvari družino, da nastaviš ime.",
    "joinFamily": {
      "help": "Vnesi kodo vabila od družinskega člana.",
      "title": "Pridruži se družini",
      "placeholder": "Koda vabila",
      "invalidCode": "Vnesi kodo vabila.",
      "joined": "Zdaj si v družini."
    },
    "createFamily": {
      "title": "Ustvari družino",
      "desc": "Ustvari novo družino in povabi druge.",
      "placeholder": "Ime družine",
      "nameRequired": "Vnesi ime družine.",
      "created": "Družina ustvarjena."
    },
    "deleteFamily": {
      "title": "Izbriši družino",
      "body": "To bo izbrisalo družino in vse podatke. Ni mogoče razveljaviti.",
      "confirm": "Izbriši",
      "deleted": "Družina izbrisana.",
      "help": "Družino lahko izbrišeš samo, če si edini član."
    },
    "setup": {
      "title": "Nastavi račun",
      "step1": "1) Pridruži se ali ustvari družino",
      "step2": "2) Nato nastavi ime v Nastavitve → Družina",
      "whyName": "Ime se shrani kot član družine, zato je na voljo po pridružitvi.",
      "next": "Naslednji korak",
      "setNameNow": "Nastavi svoje ime, da te bodo drugi prepoznali."
    },
    "leaveFamily": {
      "title": "Zapusti družino",
      "body": "Ali si prepričan/a, da želiš zapustiti družino?",
      "confirm": "Zapusti",
      "left": "Zapustil/a si družino."
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
      "days": "dni",
      "none": "Ne ponavljaj",
      "label": "Ponovi"
    },
    "today": "Danes",
    "tomorrow": "Jutri",
    "assignTo": "Dodeli",
    "assign": {
      "none": "Ni dodeljeno",
      "select": "Izberi",
      "clear": "Počisti izbiro"
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
    "calendarMissing": "Izbirnik koledarja ni nameščen. Vnesi DDMM; koledar je neobvezen.",
    "active": "Aktivno",
    "done": "Opravljeno",
    "review": "Za odobritev",
    "selectedDate": "Izbrani datum",
    "dateNotSet": "—",
    "repeatFor": "Ponovi opravilo za",
    "repeatDaysPlaceholder": "___"
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
    "doneToday": "Danes opravljeno",
    "noFamilyTitle": "Še nisi v družini.",
    "noFamilyBody": "Pridruži se/ustvari družino v Nastavitve → Družina.",
    "countLine": "{{n}} članov",
    "actions": {
      "subtitle": "Uredi člana",
      "roleTitle": "Vloga",
      "rename": "Preimenuj",
      "remove": "Odstrani"
    },
    "rename": {
      "title": "Preimenuj",
      "placeholder": "Novo ime"
    },
    "lastParent": {
      "cantChangeRole": "Ne moreš spremeniti vloge zadnjega starša. Najprej dodaj še enega starša.",
      "cantRemove": "Ne moreš odstraniti zadnjega starša. Najprej dodaj še enega starša.",
      "notice": "To je zadnji starš, zato mu ne moreš spremeniti vloge ali ga odstraniti."
    },
    "remove": {
      "title": "Odstranim člana?",
      "body": "Opravila ostanejo, vendar se član odstrani in dodelitve se počistijo."
    },
    "fallbackMember": "Član",
    "changeOwnNameHint": "Svoje ime spremeni v Nastavitve → Družina.",
    "memberFallback": "Član",
    "editMember": "Uredi člana",
    "roleTitle": "Vloga",
    "lastParentNotice": "To je zadnji starš, zato mu ne moreš spremeniti vloge ali ga odstraniti.",
    "removeTitle": "Odstranim člana?",
    "removeBody": "Opravila ostanejo, vendar se član odstrani in dodelitve se počistijo.",
    "count": "{{n}} članov",
    "newNamePlaceholder": "Novo ime"
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
    },
    "brandTitle": "FamiGo",
    "scopeHint": {
      "me": "Opravila zate",
      "kids": "Opravila za vse otroke",
      "family": "Vsa družinska opravila"
    },
    "info": {
      "scope": {
        "title": "Pogledi",
        "body": "Izberi, čigava opravila prikazati: Družina, Otroci ali Jaz."
      },
      "review": {
        "title": "Čaka odobritev",
        "body": {
          "parent": "Odobri ali zavrni opravila, ki so označena kot opravljena.",
          "child": "Ko zahtevaš potrditev, jo mora odobriti starš."
        }
      },
      "actions": {
        "title": "Gumbi",
        "open": "Prevzemi — vzemi opravilo zase.",
        "claimed": "Zahtevaj potrditev — prosi starša za odobritev.",
        "review": {
          "parent": "Odobri / Zavrni — odloči, ali je opravljeno.",
          "child": "Čakanje — starš bo odobril ali zavrnil."
        }
      }
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
    "title": "Nakupi",
    "chip": {
      "detergent": "Detergent za perilo",
      "toiletPaper": "Toaletni papir",
      "water": "Voda",
      "milk": "Mleko",
      "bread": "Kruh",
      "eggs": "Jajca",
      "fruit": "Sadje",
      "vegetables": "Zelenjava",
      "meat": "Meso",
      "cheese": "Sir",
      "shampoo": "Šampon",
      "dishSoap": "Detergent za posodo"
    },
    "bought7days": "Kupljeno (7 dni)",
    "bought7d": "Kupljeno (7 dni)",
    "bought": "Kupljeno",
    "boughtEmptyTitle": "Ni nedavnih nakupov",
    "boughtEmptyBody": "Tukaj bodo prikazani izdelki kupljeni v zadnjih 7 dneh.",
    "addedBy": "Dodano od",
    "addedAt": "Dodano",
    "boughtWhen": "Kupljeno"
  }
};

const fr = {
  "tabs": {
    "home": "Aujourd’hui",
    "members": "Membres",
    "tasks": "Tâches",
    "settings": "Réglages",
    "shopping": "Courses"
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
    "info": "Infos",
    "me": "Moi",
    "on": "Activé",
    "off": "Désactivé",
    "success": "Succès"
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
      "title": "Famille",
      "nextStepTitle": "Étape suivante",
      "nextStepBody": "Définis ton nom pour que les autres puissent te reconnaître.",
      "notInFamilyTitle": "Pas encore de famille"
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
      "renameFamily": "Renommer",
      "setYourName": "Définir ton nom",
      "leaveFamily": "Quitter la famille",
      "deleteFamily": "Supprimer la famille",
      "showInviteCode": "Afficher le code d'invitation",
      "setName": "Définir votre nom",
      "hideInviteCode": "Masquer le code d’invitation",
      "createFamily": "Créer une famille",
      "joinFamily": "Rejoindre la famille",
      "join": "Rejoindre"
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
      "inviteCode": "Code d’invitation",
      "yourName": "Ton nom",
      "myName": "Votre nom"
    },
    "notSet": "Non défini",
    "onlyMemberDeleteHint": "Tu peux supprimer la famille seulement si tu es le seul membre.",
    "nameAfterJoin": "Rejoignez ou créez une famille pour définir votre nom.",
    "joinFamily": {
      "help": "Saisissez un code d’invitation d’un membre de la famille.",
      "title": "Rejoindre la famille",
      "placeholder": "Code d’invitation",
      "invalidCode": "Saisissez le code d’invitation.",
      "joined": "Vous êtes maintenant dans la famille."
    },
    "createFamily": {
      "title": "Créer une famille",
      "desc": "Créez une nouvelle famille et invitez les autres.",
      "placeholder": "Nom de la famille",
      "nameRequired": "Saisissez un nom de famille.",
      "created": "Famille créée."
    },
    "deleteFamily": {
      "title": "Supprimer la famille",
      "body": "Cela supprimera la famille et toutes ses données. Action irréversible.",
      "confirm": "Supprimer",
      "deleted": "Famille supprimée.",
      "help": "Vous pouvez supprimer la famille uniquement si vous en êtes le seul membre."
    },
    "setup": {
      "title": "Configurer votre compte",
      "step1": "1) Rejoignez ou créez une famille",
      "step2": "2) Puis définissez votre nom dans Paramètres → Famille",
      "whyName": "Votre nom est enregistré comme membre de la famille, donc disponible après avoir rejoint.",
      "next": "Prochaine étape",
      "setNameNow": "Définissez votre nom pour que les autres puissent vous reconnaître."
    },
    "leaveFamily": {
      "title": "Quitter la famille",
      "body": "Êtes-vous sûr de vouloir quitter la famille ?",
      "confirm": "Quitter",
      "left": "Vous avez quitté la famille."
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
      "days": "jours",
      "none": "Ne pas répéter",
      "label": "Répéter"
    },
    "today": "Aujourd’hui",
    "tomorrow": "Demain",
    "assignTo": "Attribuer à",
    "assign": {
      "none": "Non attribué",
      "select": "Sélectionner",
      "clear": "Effacer la sélection"
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
    "calendarMissing": "Sélecteur calendrier non installé. Saisis JJMM ; le calendrier est optionnel.",
    "active": "Actives",
    "done": "Terminées",
    "review": "À valider",
    "selectedDate": "Date sélectionnée",
    "dateNotSet": "—",
    "repeatFor": "Répéter la tâche pour",
    "repeatDaysPlaceholder": "___"
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
    "doneToday": "Fait aujourd’hui",
    "noFamilyTitle": "Vous n’êtes pas encore dans une famille.",
    "noFamilyBody": "Rejoignez/créez une famille dans Réglages → Famille.",
    "countLine": "{{n}} membres",
    "actions": {
      "subtitle": "Modifier le membre",
      "roleTitle": "Rôle",
      "rename": "Renommer",
      "remove": "Retirer"
    },
    "rename": {
      "title": "Renommer",
      "placeholder": "Nouveau nom"
    },
    "lastParent": {
      "cantChangeRole": "Vous ne pouvez pas changer le rôle du dernier parent. Ajoutez d’abord un autre parent.",
      "cantRemove": "Vous ne pouvez pas retirer le dernier parent. Ajoutez d’abord un autre parent.",
      "notice": "C’est le dernier parent, vous ne pouvez pas changer son rôle ni le retirer."
    },
    "remove": {
      "title": "Retirer le membre ?",
      "body": "Les tâches restent, mais le membre est retiré et les assignations sont supprimées."
    },
    "fallbackMember": "Membre",
    "changeOwnNameHint": "Modifiez votre nom dans Paramètres → Famille.",
    "memberFallback": "Membre",
    "editMember": "Modifier le membre",
    "roleTitle": "Rôle",
    "lastParentNotice": "C'est le dernier parent, vous ne pouvez donc pas changer son rôle ni le supprimer.",
    "removeTitle": "Supprimer le membre ?",
    "removeBody": "Les tâches restent, mais le membre est supprimé et ses attributions sont effacées.",
    "count": "{{n}} membres",
    "newNamePlaceholder": "Nouveau nom"
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
    },
    "brandTitle": "FamiGo",
    "scopeHint": {
      "me": "Tâches pour vous",
      "kids": "Tâches pour tous les enfants",
      "family": "Toutes les tâches de la famille"
    },
    "info": {
      "scope": {
        "title": "Vues",
        "body": "Choisissez quelles tâches afficher : Famille, Enfants ou Moi."
      },
      "review": {
        "title": "En attente d’approbation",
        "body": {
          "parent": "Approuvez ou refusez les tâches demandées comme terminées.",
          "child": "Quand vous demandez la validation, un parent doit approuver."
        }
      },
      "actions": {
        "title": "Boutons",
        "open": "Prendre — prenez la tâche pour vous.",
        "claimed": "Demander validation — demandez à un parent d’approuver.",
        "review": {
          "parent": "Approuver / Refuser — décidez si c’est fait.",
          "child": "En attente — un parent va approuver ou refuser."
        }
      }
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
    "title": "Courses",
    "chip": {
      "detergent": "Lessive",
      "toiletPaper": "Papier toilette",
      "water": "Eau",
      "milk": "Lait",
      "bread": "Pain",
      "eggs": "Oeufs",
      "fruit": "Fruits",
      "vegetables": "Légumes",
      "meat": "Viande",
      "cheese": "Fromage",
      "shampoo": "Shampooing",
      "dishSoap": "Liquide vaisselle"
    },
    "bought7days": "Acheté (7 jours)",
    "bought7d": "Acheté (7 jours)",
    "bought": "Acheté",
    "boughtEmptyTitle": "Aucun achat récent",
    "boughtEmptyBody": "Les articles achetés ces 7 derniers jours s’afficheront ici.",
    "addedBy": "Ajouté par",
    "addedAt": "Ajouté",
    "boughtWhen": "Acheté"
  }
};

const de = {
  "tabs": {
    "home": "Heute",
    "members": "Mitglieder",
    "tasks": "Aufgaben",
    "settings": "Einstellungen",
    "shopping": "Einkauf"
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
    "me": "Ich",
    "on": "An",
    "off": "Aus",
    "success": "Erfolg"
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
      "title": "Familie",
      "nextStepTitle": "Nächster Schritt",
      "nextStepBody": "Bitte lege deinen Namen fest, damit dich andere erkennen können.",
      "notInFamilyTitle": "Noch keine Familie"
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
      "renameFamily": "Umbenennen",
      "setYourName": "Namen festlegen",
      "leaveFamily": "Familie verlassen",
      "deleteFamily": "Familie löschen",
      "showInviteCode": "Einladungscode anzeigen",
      "setName": "Namen festlegen",
      "hideInviteCode": "Einladungscode verbergen",
      "createFamily": "Familie erstellen",
      "joinFamily": "Familie beitreten",
      "join": "Beitreten"
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
      "inviteCode": "Einladungscode",
      "yourName": "Dein Name",
      "myName": "Dein Name"
    },
    "notSet": "Nicht festgelegt",
    "onlyMemberDeleteHint": "Du kannst die Familie nur löschen, wenn du das einzige Mitglied bist.",
    "nameAfterJoin": "Tritt einer Familie bei oder erstelle eine, um deinen Namen zu setzen.",
    "joinFamily": {
      "help": "Gib einen Einladungscode von einem Familienmitglied ein.",
      "title": "Familie beitreten",
      "placeholder": "Einladungscode",
      "invalidCode": "Gib den Einladungscode ein.",
      "joined": "Du bist jetzt in der Familie."
    },
    "createFamily": {
      "title": "Familie erstellen",
      "desc": "Erstelle eine neue Familie und lade andere ein.",
      "placeholder": "Familienname",
      "nameRequired": "Gib einen Familiennamen ein.",
      "created": "Familie erstellt."
    },
    "deleteFamily": {
      "title": "Familie löschen",
      "body": "Dadurch wird die Familie und alle Daten gelöscht. Das kann nicht rückgängig gemacht werden.",
      "confirm": "Löschen",
      "deleted": "Familie gelöscht.",
      "help": "Du kannst die Familie nur löschen, wenn du das einzige Mitglied bist."
    },
    "setup": {
      "title": "Konto einrichten",
      "step1": "1) Einer Familie beitreten oder erstellen",
      "step2": "2) Danach Namen in Einstellungen → Familie setzen",
      "whyName": "Dein Name wird als Familienmitglied gespeichert und ist erst nach dem Beitritt verfügbar.",
      "next": "Nächster Schritt",
      "setNameNow": "Bitte setze deinen Namen, damit andere dich erkennen."
    },
    "leaveFamily": {
      "title": "Familie verlassen",
      "body": "Möchtest du die Familie wirklich verlassen?",
      "confirm": "Verlassen",
      "left": "Du hast die Familie verlassen."
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
      "days": "Tage",
      "none": "Nicht wiederholen",
      "label": "Wiederholen"
    },
    "today": "Heute",
    "tomorrow": "Morgen",
    "assignTo": "Zuweisen an",
    "assign": {
      "none": "Nicht zugewiesen",
      "select": "Auswählen",
      "clear": "Auswahl löschen"
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
    "calendarMissing": "Kalenderauswahl nicht installiert. Gib TTMM ein; Kalender ist optional.",
    "active": "Aktiv",
    "done": "Erledigt",
    "review": "Zur Freigabe",
    "selectedDate": "Ausgewähltes Datum",
    "dateNotSet": "—",
    "repeatFor": "Aufgabe wiederholen alle",
    "repeatDaysPlaceholder": "___"
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
    "doneToday": "Heute erledigt",
    "noFamilyTitle": "Du bist noch in keiner Familie.",
    "noFamilyBody": "Tritt einer Familie bei oder erstelle eine in Einstellungen → Familie.",
    "countLine": "{{n}} Mitglieder",
    "actions": {
      "subtitle": "Mitglied bearbeiten",
      "roleTitle": "Rolle",
      "rename": "Umbenennen",
      "remove": "Entfernen"
    },
    "rename": {
      "title": "Umbenennen",
      "placeholder": "Neuer Name"
    },
    "lastParent": {
      "cantChangeRole": "Du kannst die Rolle des letzten Elternteils nicht ändern. Füge zuerst einen weiteren Elternteil hinzu.",
      "cantRemove": "Du kannst den letzten Elternteil nicht entfernen. Füge zuerst einen weiteren Elternteil hinzu.",
      "notice": "Das ist der letzte Elternteil, daher kannst du seine Rolle nicht ändern oder ihn entfernen."
    },
    "remove": {
      "title": "Mitglied entfernen?",
      "body": "Aufgaben bleiben bestehen, aber das Mitglied wird entfernt und Zuweisungen werden gelöscht."
    },
    "fallbackMember": "Mitglied",
    "changeOwnNameHint": "Ändere deinen Namen in Einstellungen → Familie.",
    "memberFallback": "Mitglied",
    "editMember": "Mitglied bearbeiten",
    "roleTitle": "Rolle",
    "lastParentNotice": "Das ist das letzte Elternteil – du kannst die Rolle nicht ändern oder die Person entfernen.",
    "removeTitle": "Mitglied entfernen?",
    "removeBody": "Aufgaben bleiben erhalten, aber das Mitglied wird entfernt und Zuweisungen werden gelöscht.",
    "count": "{{n}} Mitglieder",
    "newNamePlaceholder": "Neuer Name"
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
    },
    "brandTitle": "FamiGo",
    "scopeHint": {
      "me": "Aufgaben für dich",
      "kids": "Aufgaben für alle Kinder",
      "family": "Alle Familienaufgaben"
    },
    "info": {
      "scope": {
        "title": "Ansichten",
        "body": "Wähle, wessen Aufgaben angezeigt werden: Familie, Kinder oder Ich."
      },
      "review": {
        "title": "Wartet auf Freigabe",
        "body": {
          "parent": "Genehmige oder lehne Aufgaben ab, die als erledigt gemeldet wurden.",
          "child": "Wenn du „Erledigt anfragen“ drückst, muss ein Elternteil bestätigen."
        }
      },
      "actions": {
        "title": "Buttons",
        "open": "Übernehmen — nimm die Aufgabe für dich.",
        "claimed": "Fertig anfragen — bitte ein Elternteil um Freigabe.",
        "review": {
          "parent": "Genehmigen / Ablehnen — entscheide, ob erledigt.",
          "child": "Warten — ein Elternteil entscheidet."
        }
      }
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
    "title": "Einkauf",
    "chip": {
      "detergent": "Waschmittel",
      "toiletPaper": "Toilettenpapier",
      "water": "Wasser",
      "milk": "Milch",
      "bread": "Brot",
      "eggs": "Eier",
      "fruit": "Obst",
      "vegetables": "Gemüse",
      "meat": "Fleisch",
      "cheese": "Käse",
      "shampoo": "Shampoo",
      "dishSoap": "Spülmittel"
    },
    "bought7days": "Gekauft (7 Tage)",
    "bought7d": "Gekauft (7 Tage)",
    "bought": "Gekauft",
    "boughtEmptyTitle": "Keine recenten Einkäufe",
    "boughtEmptyBody": "Hier werden Artikel angezeigt, die in den letzten 7 Tagen gekauft wurden.",
    "addedBy": "Hinzugefügt von",
    "addedAt": "Hinzugefügt",
    "boughtWhen": "Gekauft"
  }
};

const es = {
  "tabs": {
    "home": "Hoy",
    "members": "Miembros",
    "tasks": "Tareas",
    "settings": "Ajustes",
    "shopping": "Compras"
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
    "me": "Yo",
    "on": "Activado",
    "off": "Desactivado",
    "success": "Éxito"
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
      "title": "Familia",
      "nextStepTitle": "Siguiente paso",
      "nextStepBody": "Establece tu nombre para que los demás puedan reconocerte.",
      "notInFamilyTitle": "Aún sin familia"
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
      "renameFamily": "Renombrar",
      "setYourName": "Establecer tu nombre",
      "leaveFamily": "Salir de la familia",
      "deleteFamily": "Eliminar familia",
      "showInviteCode": "Mostrar código de invitación",
      "setName": "Establecer nombre",
      "hideInviteCode": "Ocultar código de invitación",
      "createFamily": "Crear familia",
      "joinFamily": "Unirse a la familia",
      "join": "Unirse"
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
      "inviteCode": "Código de invitación",
      "yourName": "Tu nombre",
      "myName": "Tu nombre"
    },
    "notSet": "No establecido",
    "onlyMemberDeleteHint": "Solo puedes eliminar la familia si eres el único miembro.",
    "nameAfterJoin": "Únete o crea una familia para establecer tu nombre.",
    "joinFamily": {
      "help": "Introduce un código de invitación de un miembro de la familia.",
      "title": "Unirse a la familia",
      "placeholder": "Código de invitación",
      "invalidCode": "Introduce el código de invitación.",
      "joined": "Ahora estás en la familia."
    },
    "createFamily": {
      "title": "Crear familia",
      "desc": "Crea una nueva familia e invita a otros.",
      "placeholder": "Nombre de la familia",
      "nameRequired": "Introduce un nombre de familia.",
      "created": "Familia creada."
    },
    "deleteFamily": {
      "title": "Eliminar familia",
      "body": "Esto eliminará la familia y todos sus datos. No se puede deshacer.",
      "confirm": "Eliminar",
      "deleted": "Familia eliminada.",
      "help": "Solo puedes eliminar la familia si eres el único miembro."
    },
    "setup": {
      "title": "Configurar tu cuenta",
      "step1": "1) Únete o crea una familia",
      "step2": "2) Luego establece tu nombre en Ajustes → Familia",
      "whyName": "Tu nombre se guarda como miembro de la familia, así que está disponible tras unirte.",
      "next": "Siguiente paso",
      "setNameNow": "Establece tu nombre para que otros puedan reconocerte."
    },
    "leaveFamily": {
      "title": "Salir de la familia",
      "body": "¿Seguro que quieres salir de la familia?",
      "confirm": "Salir",
      "left": "Has salido de la familia."
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
      "days": "días",
      "none": "No repetir",
      "label": "Repetir"
    },
    "today": "Hoy",
    "tomorrow": "Mañana",
    "assignTo": "Asignar a",
    "assign": {
      "none": "No asignado",
      "select": "Seleccionar",
      "clear": "Borrar selección"
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
    "calendarMissing": "Selector de calendario no instalado. Introduce DDMM; el calendario es opcional.",
    "active": "Activas",
    "done": "Hechas",
    "review": "Por aprobar",
    "selectedDate": "Fecha seleccionada",
    "dateNotSet": "—",
    "repeatFor": "Repetir tarea cada",
    "repeatDaysPlaceholder": "___"
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
    "doneToday": "Hecho hoy",
    "noFamilyTitle": "Aún no estás en una familia.",
    "noFamilyBody": "Únete/crea una familia en Ajustes → Familia.",
    "countLine": "{{n}} miembros",
    "actions": {
      "subtitle": "Editar miembro",
      "roleTitle": "Rol",
      "rename": "Renombrar",
      "remove": "Eliminar"
    },
    "rename": {
      "title": "Renombrar",
      "placeholder": "Nuevo nombre"
    },
    "lastParent": {
      "cantChangeRole": "No puedes cambiar el rol del último padre/madre. Añade primero otro padre/madre.",
      "cantRemove": "No puedes eliminar al último padre/madre. Añade primero otro padre/madre.",
      "notice": "Es el último padre/madre, así que no puedes cambiar su rol ni eliminarlo."
    },
    "remove": {
      "title": "¿Eliminar miembro?",
      "body": "Las tareas se mantienen, pero el miembro se elimina y se limpian las asignaciones."
    },
    "fallbackMember": "Miembro",
    "changeOwnNameHint": "Cambia tu nombre en Ajustes → Familia.",
    "memberFallback": "Miembro",
    "editMember": "Editar miembro",
    "roleTitle": "Rol",
    "lastParentNotice": "Este es el último padre/madre, por lo que no puedes cambiar su rol ni eliminarlo.",
    "removeTitle": "¿Eliminar miembro?",
    "removeBody": "Las tareas se mantienen, pero el miembro se elimina y se limpian sus asignaciones.",
    "count": "{{n}} miembros",
    "newNamePlaceholder": "Nuevo nombre"
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
    },
    "brandTitle": "FamiGo",
    "scopeHint": {
      "me": "Tareas para ti",
      "kids": "Tareas para todos los niños",
      "family": "Todas las tareas familiares"
    },
    "info": {
      "scope": {
        "title": "Vistas",
        "body": "Elige qué tareas mostrar: Familia, Niños o Yo."
      },
      "review": {
        "title": "En espera de aprobación",
        "body": {
          "parent": "Aprueba o rechaza las tareas marcadas como hechas.",
          "child": "Cuando pides aprobación, un padre debe confirmarlo."
        }
      },
      "actions": {
        "title": "Botones",
        "open": "Tomar — reclámala para ti.",
        "claimed": "Solicitar aprobación — pide a un padre que apruebe.",
        "review": {
          "parent": "Aprobar / Rechazar — decide si está hecho.",
          "child": "En espera — un padre aprobará o rechazará."
        }
      }
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
    "title": "Compras",
    "chip": {
      "detergent": "Detergente para ropa",
      "toiletPaper": "Papel higiénico",
      "water": "Agua",
      "milk": "Leche",
      "bread": "Pan",
      "eggs": "Huevos",
      "fruit": "Fruta",
      "vegetables": "Verduras",
      "meat": "Carne",
      "cheese": "Queso",
      "shampoo": "Champú",
      "dishSoap": "Lavavajillas"
    },
    "bought7days": "Comprado (7 días)",
    "bought7d": "Comprado (7 días)",
    "bought": "Comprado",
    "boughtEmptyTitle": "Sin compras recientes",
    "boughtEmptyBody": "Aquí se mostrarán los artículos comprados en los últimos 7 días.",
    "addedBy": "Añadido por",
    "addedAt": "Añadido",
    "boughtWhen": "Comprado"
  }
};

const rs = {
  "tabs": {
    "home": "Danas",
    "members": "Članovi",
    "tasks": "Zadaci",
    "settings": "Podešavanja",
    "shopping": "Kupovina"
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
    "me": "Ja",
    "on": "UKLJ",
    "off": "ISKLJ",
    "success": "Uspeh"
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
      "title": "Porodica",
      "nextStepTitle": "Sledeći korak",
      "nextStepBody": "Postavi svoje ime kako bi te drugi mogli prepoznati.",
      "notInFamilyTitle": "Još nema porodice"
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
      "renameFamily": "Preimenuj",
      "setYourName": "Postavi ime",
      "leaveFamily": "Napusti porodicu",
      "deleteFamily": "Obriši porodicu",
      "showInviteCode": "Prikaži pozivni kod",
      "setName": "Postavi ime",
      "hideInviteCode": "Sakrij pozivni kod",
      "createFamily": "Napravi porodicu",
      "joinFamily": "Pridruži se porodici",
      "join": "Pridruži se"
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
      "inviteCode": "Pozivni kod",
      "yourName": "Tvoje ime",
      "myName": "Tvoje ime"
    },
    "notSet": "Nije postavljeno",
    "onlyMemberDeleteHint": "Porodicu možeš obrisati samo ako si jedini član.",
    "nameAfterJoin": "Pridruži se ili napravi porodicu da postaviš ime.",
    "joinFamily": {
      "help": "Unesi pozivni kod od člana porodice.",
      "title": "Pridruži se porodici",
      "placeholder": "Pozivni kod",
      "invalidCode": "Unesi pozivni kod.",
      "joined": "Sada si u porodici."
    },
    "createFamily": {
      "title": "Napravi porodicu",
      "desc": "Napravi novu porodicu i pozovi ostale.",
      "placeholder": "Naziv porodice",
      "nameRequired": "Unesi naziv porodice.",
      "created": "Porodica je kreirana."
    },
    "deleteFamily": {
      "title": "Obriši porodicu",
      "body": "Ovo će obrisati porodicu i sve podatke. Ne može se poništiti.",
      "confirm": "Obriši",
      "deleted": "Porodica obrisana.",
      "help": "Porodicu možeš obrisati samo ako si jedini član."
    },
    "setup": {
      "title": "Podesi nalog",
      "step1": "1) Pridruži se ili napravi porodicu",
      "step2": "2) Zatim postavi ime u Podešavanja → Porodica",
      "whyName": "Ime se čuva kao član porodice, pa je dostupno nakon pridruživanja.",
      "next": "Sledeći korak",
      "setNameNow": "Postavi svoje ime da bi te drugi prepoznali."
    },
    "leaveFamily": {
      "title": "Napusti porodicu",
      "body": "Da li si siguran/na da želiš da napustiš porodicu?",
      "confirm": "Napusti",
      "left": "Napustio/la si porodicu."
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
      "days": "dana",
      "none": "Ne ponavljaj",
      "label": "Ponavljanje"
    },
    "today": "Danas",
    "tomorrow": "Sutra",
    "assignTo": "Dodeli",
    "assign": {
      "none": "Nije dodeljeno",
      "select": "Izaberi",
      "clear": "Očisti izbor"
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
    "calendarMissing": "Izbor kalendara nije instaliran. Unesi DDMM; kalendar je opcion.",
    "active": "Aktivno",
    "done": "Urađeno",
    "review": "Za potvrdu",
    "selectedDate": "Izabrani datum",
    "dateNotSet": "—",
    "repeatFor": "Ponavljaj zadatak",
    "repeatDaysPlaceholder": "___"
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
    "doneToday": "Danas urađeno",
    "noFamilyTitle": "Još nisi u porodici.",
    "noFamilyBody": "Pridruži se/napravi porodicu u Postavke → Porodica.",
    "countLine": "{{n}} članova",
    "actions": {
      "subtitle": "Uredi člana",
      "roleTitle": "Uloga",
      "rename": "Preimenuj",
      "remove": "Obriši"
    },
    "rename": {
      "title": "Preimenuj",
      "placeholder": "Novo ime"
    },
    "lastParent": {
      "cantChangeRole": "Ne možeš promeniti ulogu zadnjeg roditelja. Dodaj još jednog roditelja pa pokušaj opet.",
      "cantRemove": "Ne možeš obrisati zadnjeg roditelja. Dodaj još jednog roditelja pa pokušaj opet.",
      "notice": "Ovo je zadnji roditelj pa mu ne možeš promeniti ulogu niti ga obrisati."
    },
    "remove": {
      "title": "Obrisati člana?",
      "body": "Zadaci ostaju, ali se uklanja član i sve dodele tom članu."
    },
    "fallbackMember": "Član",
    "changeOwnNameHint": "Svoje ime menjaš u Podešavanja → Porodica.",
    "memberFallback": "Član",
    "editMember": "Uredi člana",
    "roleTitle": "Uloga",
    "lastParentNotice": "Ovo je zadnji roditelj pa mu ne možeš promeniti ulogu niti ga obrisati.",
    "removeTitle": "Obrisati člana?",
    "removeBody": "Zadaci ostaju, ali se uklanja član i sve dodele tom članu.",
    "count": "{{n}} članova",
    "newNamePlaceholder": "Novo ime"
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
    },
    "brandTitle": "FamiGo",
    "scopeHint": {
      "me": "Zadaci za tebe",
      "kids": "Zadaci za svu decu",
      "family": "Svi porodični zadaci"
    },
    "info": {
      "scope": {
        "title": "Prikazi",
        "body": "Izaberi čije zadatke prikazati: Porodica, Deca ili Ja."
      },
      "review": {
        "title": "Čeka odobrenje",
        "body": {
          "parent": "Odobri ili odbij zadatke označene kao urađene.",
          "child": "Kad zatražiš potvrdu, roditelj treba da odobri."
        }
      },
      "actions": {
        "title": "Dugmad",
        "open": "Preuzmi — uzmi zadatak za sebe.",
        "claimed": "Traži potvrdu — zatraži od roditelja da odobri.",
        "review": {
          "parent": "Odobri / Odbij — odluči da li je gotovo.",
          "child": "Čekanje — roditelj će odobriti ili odbiti."
        }
      }
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
    "title": "Kupovina",
    "chip": {
      "detergent": "Deterdžent za veš",
      "toiletPaper": "Toalet papir",
      "water": "Voda",
      "milk": "Mleko",
      "bread": "Hleb",
      "eggs": "Jaja",
      "fruit": "Voće",
      "vegetables": "Povrće",
      "meat": "Meso",
      "cheese": "Sir",
      "shampoo": "Šampon",
      "dishSoap": "Deterdžent za suđe"
    },
    "bought7days": "Kupljeno (7 dana)",
    "bought7d": "Kupljeno (7 dana)",
    "bought": "Kupljeno",
    "boughtEmptyTitle": "Nema skorašnjih kupovina",
    "boughtEmptyBody": "Stavke kupljene u poslednjih 7 dana prikazaće se ovde.",
    "addedBy": "Dodao/la",
    "addedAt": "Dodano",
    "boughtWhen": "Kupljeno"
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
