"use client";

import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";
import PillTabs from "@/components/ui/PillTabs";
import StatCard from "@/components/ui/StatCard";
import { formatMoney as formatPreferenceMoney } from "@/features/dashboard/format";
import { useUserPreferences } from "@/features/settings/useUserPreferences";
import {
  ArrowDownLeft,
  ArrowUpRight,
  CalendarClock,
  CheckCircle2,
  Clock3,
  HandCoins,
  NotebookPen,
  Plus,
  Search,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { useMemo, useState } from "react";

type DebtDirection = "I_OWE" | "OWES_ME";
type DebtCategory =
  | "Family"
  | "Friends"
  | "Work"
  | "Emergency"
  | "Business"
  | "Other";
type DebtStatus = "OPEN" | "DUE_SOON" | "OVERDUE" | "SETTLED";
type DebtEventType = "CREATE" | "REPAYMENT" | "ADDITIONAL";
type DebtFilter = "ACTIVE" | "I_OWE" | "OWES_ME" | "DUE_SOON" | "SETTLED";
type SidePanelTab = "DETAILS" | "FORM";
type UiLanguage = "MN" | "EN";

type DebtEvent = {
  id: string;
  type: DebtEventType;
  amount: number;
  date: string;
  note: string;
};

type DebtRecord = {
  id: string;
  person: string;
  direction: DebtDirection;
  category: DebtCategory;
  reason: string;
  note: string;
  openedAt: string;
  dueDate: string;
  events: DebtEvent[];
};

type ActionDraft = {
  type: "REPAYMENT" | "ADDITIONAL";
  amount: string;
  date: string;
  note: string;
};

type FormDraft = {
  direction: DebtDirection;
  person: string;
  amount: string;
  category: DebtCategory;
  reason: string;
  note: string;
  openedAt: string;
  dueDate: string;
};

const todayIso = "2026-04-16";

const initialRecords: DebtRecord[] = [
  {
    id: "debt-1",
    person: "Bat-Erdene",
    direction: "I_OWE",
    category: "Friends",
    reason: "Camera rental cash shortfall",
    note: "Need to finish clearing this before the next freelance payout.",
    openedAt: "2026-04-02",
    dueDate: "2026-04-18",
    events: [
      {
        id: "debt-1-e1",
        type: "CREATE",
        amount: 180000,
        date: "2026-04-02",
        note: "Borrowed for a same-day rental payment.",
      },
      {
        id: "debt-1-e2",
        type: "REPAYMENT",
        amount: 50000,
        date: "2026-04-09",
        note: "First partial repayment.",
      },
      {
        id: "debt-1-e3",
        type: "ADDITIONAL",
        amount: 30000,
        date: "2026-04-12",
        note: "Borrowed a little more for transport and accessories.",
      },
    ],
  },
  {
    id: "debt-2",
    person: "Namuun",
    direction: "OWES_ME",
    category: "Work",
    reason: "Shared studio booking and prop costs",
    note: "She pays back after the brand campaign invoice clears.",
    openedAt: "2026-04-01",
    dueDate: "2026-04-17",
    events: [
      {
        id: "debt-2-e1",
        type: "CREATE",
        amount: 260000,
        date: "2026-04-01",
        note: "I covered the booking and prop purchase.",
      },
      {
        id: "debt-2-e2",
        type: "REPAYMENT",
        amount: 100000,
        date: "2026-04-10",
        note: "First transfer received.",
      },
    ],
  },
  {
    id: "debt-3",
    person: "Ariuka",
    direction: "OWES_ME",
    category: "Friends",
    reason: "Trip booking split",
    note: "Waiting on the rest after salary day.",
    openedAt: "2026-03-28",
    dueDate: "2026-04-14",
    events: [
      {
        id: "debt-3-e1",
        type: "CREATE",
        amount: 120000,
        date: "2026-03-28",
        note: "I paid the booking in full.",
      },
      {
        id: "debt-3-e2",
        type: "REPAYMENT",
        amount: 30000,
        date: "2026-04-04",
        note: "Partial reimbursement received.",
      },
    ],
  },
  {
    id: "debt-4",
    person: "Eej",
    direction: "I_OWE",
    category: "Family",
    reason: "Emergency pharmacy cost",
    note: "This one is already closed.",
    openedAt: "2026-03-20",
    dueDate: "2026-03-30",
    events: [
      {
        id: "debt-4-e1",
        type: "CREATE",
        amount: 90000,
        date: "2026-03-20",
        note: "Borrowed to cover medicine and taxi.",
      },
      {
        id: "debt-4-e2",
        type: "REPAYMENT",
        amount: 90000,
        date: "2026-03-27",
        note: "Repaid in full.",
      },
    ],
  },
  {
    id: "debt-5",
    person: "Tugsuu",
    direction: "I_OWE",
    category: "Business",
    reason: "Short-term print production advance",
    note: "Expected to clear when the client pays.",
    openedAt: "2026-04-11",
    dueDate: "2026-04-23",
    events: [
      {
        id: "debt-5-e1",
        type: "CREATE",
        amount: 140000,
        date: "2026-04-11",
        note: "Advance taken for printing and delivery.",
      },
    ],
  },
];

const initialActionDraft: ActionDraft = {
  type: "REPAYMENT",
  amount: "",
  date: todayIso,
  note: "",
};

const initialFormDraft: FormDraft = {
  direction: "I_OWE",
  person: "",
  amount: "",
  category: "Friends",
  reason: "",
  note: "",
  openedAt: todayIso,
  dueDate: "2026-04-25",
};

const debtCopy = {
  EN: {
    heroTitle: "Track every amount you owe and every amount owed to you",
    heroDescription: "Personal borrowing and lending, kept visible by person.",
    frontendPrototype: "Frontend prototype",
    totalIOwe: "Total I Owe",
    totalOwedToMe: "Total Owed To Me",
    netPosition: "Net Position",
    dueSoon: "Due Soon",
    ledgerEyebrow: "Ledger",
    ledgerTitle: "People & balances",
    ledgerDescription: "Open by person.",
    active: "active",
    settled: "settled",
    searchPlaceholder: "Search person or reason",
    filterActive: "Active",
    filterIOwe: "I Owe",
    filterOwesMe: "Owes Me",
    filterDueSoon: "Due Soon",
    filterSettled: "Settled",
    category: "Category",
    all: "All",
    noDebtRecordMatches: "No debt record matches the current filter.",
    remaining: "Remaining",
    from: "from",
    due: "Due",
    paid: "Paid",
    last: "Last",
    events: "Events",
    eventCount: "events",
    sidePanelEyebrow: "Side panel",
    noRecordSelected: "No record selected",
    chooseRecord: "Choose a row from the ledger to inspect its detail.",
    editDebtRecord: "Edit debt record",
    addBorrowedOrLentMoney: "Add borrowed or lent money",
    updatePersonAmountDue: "Update person, amount, due date, and reason.",
    createDebtCase: "Create a new debt case.",
    details: "Details",
    newRecord: "New Record",
    edit: "Edit",
    dueDate: "Due date",
    started: "Started",
    noExtraNote: "No extra note",
    updateDebtRecord: "Update this debt record",
    delete: "Delete",
    settle: "Settle",
    addRepayment: "Add repayment",
    addMore: "Add more",
    amount: "Amount",
    actionPlaceholder:
      "What happened in this payment or additional borrow/lend?",
    saveEvent: "Save event",
    timeline: "Timeline",
    iBorrowed: "I borrowed",
    iLent: "I lent",
    personName: "Person name",
    reasonPlaceholder: "Reason for borrowing or lending",
    notePlaceholder: "Extra note, agreement, or expected repayment context",
    saveChanges: "Save changes",
    addDebtRecord: "Add debt record",
    cancelEdit: "Cancel edit",
    formNotes: "Form notes",
    borrowedHint: "`I borrowed` goes into your payable side.",
    lentHint: "`I lent` goes into your receivable side.",
    syncHint: "Counterparty sync can be added from backend later.",
    deleteRecord: "Delete record",
    removePerson: "Remove {{person}}?",
    deleteDescription:
      "This removes the debt record and all timeline events from the current frontend preview.",
    cancel: "Cancel",
  },
  MN: {
    heroTitle: "Өгөх болон авах бүх мөнгөө нэг дор хяна",
    heroDescription: "Хүн тус бүрээр өр, авлагаа харагдахуйц байлга.",
    frontendPrototype: "Frontend prototype",
    totalIOwe: "Нийт өгөх",
    totalOwedToMe: "Нийт авах",
    netPosition: "Цэвэр дүн",
    dueSoon: "Ойртсон",
    ledgerEyebrow: "Бүртгэл",
    ledgerTitle: "Хүмүүс ба үлдэгдэл",
    ledgerDescription: "Хүн тус бүрийн нээлттэй дүн.",
    active: "идэвхтэй",
    settled: "хаагдсан",
    searchPlaceholder: "Хүн эсвэл шалтгаанаар хайх",
    filterActive: "Идэвхтэй",
    filterIOwe: "Миний өгөх",
    filterOwesMe: "Миний авах",
    filterDueSoon: "Ойртсон",
    filterSettled: "Хаагдсан",
    category: "Ангилал",
    all: "Бүгд",
    noDebtRecordMatches: "Одоогийн шүүлтэд таарах өрийн бүртгэл алга.",
    remaining: "Үлдэгдэл",
    from: "нийт",
    due: "Төлөх",
    paid: "Төлсөн",
    last: "Сүүлд",
    events: "Үйлдэл",
    eventCount: "үйлдэл",
    sidePanelEyebrow: "Хажуу тал",
    noRecordSelected: "Бичлэг сонгогдоогүй",
    chooseRecord: "Дэлгэрэнгүй харахын тулд жагсаалтаас нэг мөр сонго.",
    editDebtRecord: "Өрийн бүртгэл засах",
    addBorrowedOrLentMoney: "Өр эсвэл авлага нэмэх",
    updatePersonAmountDue: "Хүн, дүн, хугацаа, шалтгааныг шинэчилнэ.",
    createDebtCase: "Шинэ өрийн бүртгэл үүсгэнэ.",
    details: "Дэлгэрэнгүй",
    newRecord: "Шинэ бүртгэл",
    edit: "Засах",
    dueDate: "Хугацаа",
    started: "Эхэлсэн",
    noExtraNote: "Нэмэлт тэмдэглэл алга",
    updateDebtRecord: "Энэ өрийн бүртгэлийг шинэчлэх",
    delete: "Устгах",
    settle: "Хаах",
    addRepayment: "Төлөлт нэмэх",
    addMore: "Нэмж бүртгэх",
    amount: "Дүн",
    actionPlaceholder: "Энэ төлөлт эсвэл нэмэлт өрийн талаар тэмдэглэл үлдээ.",
    saveEvent: "Үйлдэл хадгалах",
    timeline: "Түүх",
    iBorrowed: "Би зээлсэн",
    iLent: "Би зээлдүүлсэн",
    personName: "Хүний нэр",
    reasonPlaceholder: "Яагаад зээлсэн эсвэл зээлдүүлсэн",
    notePlaceholder: "Нэмэлт тайлбар, тохиролцоо, эргэн төлөх нөхцөл",
    saveChanges: "Өөрчлөлт хадгалах",
    addDebtRecord: "Өрийн бүртгэл нэмэх",
    cancelEdit: "Засварыг цуцлах",
    formNotes: "Формын тайлбар",
    borrowedHint: "`Би зээлсэн` нь таны өгөх талд орно.",
    lentHint: "`Би зээлдүүлсэн` нь таны авах талд орно.",
    syncHint: "Нөгөө талын sync-ийг дараа нь backend-аас нэмж болно.",
    deleteRecord: "Бүртгэл устгах",
    removePerson: "{{person}}-г устгах уу?",
    deleteDescription:
      "Энэ frontend preview доторх өрийн бүртгэл болон бүх timeline event-ийг устгана.",
    cancel: "Цуцлах",
  },
} as const;

function formatMoney(
  amount: number,
  currency: "JPY" | "MNT" | "USD",
  hidden: boolean,
) {
  return formatPreferenceMoney(amount, currency, hidden);
}

function formatShortDate(value: string, locale: string) {
  return new Intl.DateTimeFormat(locale, {
    month: "short",
    day: "numeric",
  }).format(new Date(`${value}T00:00:00.000Z`));
}

function getBaseAmount(record: DebtRecord) {
  return record.events
    .filter((event) => event.type === "CREATE" || event.type === "ADDITIONAL")
    .reduce((sum, event) => sum + event.amount, 0);
}

function getPaidAmount(record: DebtRecord) {
  return record.events
    .filter((event) => event.type === "REPAYMENT")
    .reduce((sum, event) => sum + event.amount, 0);
}

function getRemainingAmount(record: DebtRecord) {
  return Math.max(0, getBaseAmount(record) - getPaidAmount(record));
}

function getStatus(record: DebtRecord): DebtStatus {
  const remaining = getRemainingAmount(record);
  if (remaining <= 0) return "SETTLED";

  const due = new Date(`${record.dueDate}T00:00:00.000Z`);
  const today = new Date(`${todayIso}T00:00:00.000Z`);
  const diffDays = Math.ceil((due.getTime() - today.getTime()) / 86400000);

  if (diffDays < 0) return "OVERDUE";
  if (diffDays <= 3) return "DUE_SOON";
  return "OPEN";
}

function getStatusLabel(status: DebtStatus, language: UiLanguage) {
  switch (status) {
    case "DUE_SOON":
      return language === "MN" ? "Ойртсон" : "Due soon";
    case "OVERDUE":
      return language === "MN" ? "Хоцорсон" : "Overdue";
    case "SETTLED":
      return language === "MN" ? "Хаагдсан" : "Settled";
    default:
      return language === "MN" ? "Нээлттэй" : "Open";
  }
}

function getDirectionLabel(direction: DebtDirection, language: UiLanguage) {
  if (language === "MN") {
    return direction === "I_OWE" ? "Миний өгөх" : "Миний авах";
  }

  return direction === "I_OWE" ? "I owe" : "Owes me";
}

function getDirectionEventLabel(
  direction: DebtDirection,
  type: DebtEventType,
  language: UiLanguage,
) {
  if (language === "MN") {
    if (type === "REPAYMENT") {
      return direction === "I_OWE" ? "Би төлсөн" : "Тэд төлсөн";
    }

    if (type === "ADDITIONAL") {
      return direction === "I_OWE" ? "Би нэмж зээлсэн" : "Би нэмж зээлдүүлсэн";
    }

    return direction === "I_OWE" ? "Би зээлсэн" : "Би зээлдүүлсэн";
  }

  if (type === "REPAYMENT") {
    return direction === "I_OWE" ? "I paid back" : "They paid back";
  }

  if (type === "ADDITIONAL") {
    return direction === "I_OWE" ? "I borrowed more" : "I lent more";
  }

  return direction === "I_OWE" ? "I borrowed" : "I lent";
}

function getStatusTone(status: DebtStatus) {
  switch (status) {
    case "OVERDUE":
      return "border-[var(--status-error-border)] bg-[var(--status-error-bg)] text-[var(--status-error-text)]";
    case "DUE_SOON":
      return "border-[var(--status-warning-border)] bg-[var(--status-warning-bg)] text-[var(--status-warning-text)]";
    case "SETTLED":
      return "border-[var(--status-success-border)] bg-[var(--status-success-bg)] text-[var(--status-success-text)]";
    default:
      return "border-[var(--chip-border)] bg-[var(--chip-bg)] text-[var(--chip-text)]";
  }
}

function getDirectionTone(direction: DebtDirection) {
  return direction === "I_OWE"
    ? "border-[var(--status-warning-border)] bg-[var(--status-warning-bg)] text-[var(--status-warning-text)]"
    : "border-[var(--status-success-border)] bg-[var(--status-success-bg)] text-[var(--status-success-text)]";
}

function SectionTitle({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div>
      <p className="soft-text text-xs font-semibold uppercase tracking-[0.18em]">
        {eyebrow}
      </p>
      <h2 className="theme-heading mt-1 text-xl font-semibold">{title}</h2>
      <p className="soft-text mt-1 text-sm leading-6">{description}</p>
    </div>
  );
}

export default function UrZeelPage() {
  const { preferences } = useUserPreferences();
  const copy = debtCopy[preferences.language];
  const locale = preferences.language === "MN" ? "mn-MN" : "en-US";
  const [records, setRecords] = useState(initialRecords);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<DebtFilter>("ACTIVE");
  const [category, setCategory] = useState<DebtCategory | "ALL">("ALL");
  const [sidePanelTab, setSidePanelTab] = useState<SidePanelTab>("DETAILS");
  const [selectedId, setSelectedId] = useState(initialRecords[0].id);
  const [editingRecordId, setEditingRecordId] = useState<string | null>(null);
  const [deleteCandidateId, setDeleteCandidateId] = useState<string | null>(
    null,
  );
  const [actionDraft, setActionDraft] = useState(initialActionDraft);
  const [formDraft, setFormDraft] = useState(initialFormDraft);

  const enrichedRecords = useMemo(
    () =>
      records.map((record) => ({
        ...record,
        total: getBaseAmount(record),
        paid: getPaidAmount(record),
        remaining: getRemainingAmount(record),
        status: getStatus(record),
        lastEvent: [...record.events].sort((left, right) =>
          left.date < right.date ? 1 : -1,
        )[0],
      })),
    [records],
  );

  const filteredRecords = useMemo(() => {
    return enrichedRecords.filter((record) => {
      const matchesSearch =
        search.trim().length === 0 ||
        record.person.toLowerCase().includes(search.toLowerCase()) ||
        record.reason.toLowerCase().includes(search.toLowerCase()) ||
        record.note.toLowerCase().includes(search.toLowerCase());

      const matchesFilter =
        filter === "ACTIVE"
          ? record.status !== "SETTLED"
          : filter === "I_OWE"
            ? record.direction === "I_OWE" && record.status !== "SETTLED"
            : filter === "OWES_ME"
              ? record.direction === "OWES_ME" && record.status !== "SETTLED"
              : filter === "DUE_SOON"
                ? record.status === "DUE_SOON" || record.status === "OVERDUE"
                : record.status === "SETTLED";

      const matchesCategory =
        category === "ALL" ? true : record.category === category;

      return matchesSearch && matchesFilter && matchesCategory;
    });
  }, [category, enrichedRecords, filter, search]);

  const selectedRecord =
    filteredRecords.find((record) => record.id === selectedId) ??
    filteredRecords[0] ??
    null;

  const selectedTimeline = selectedRecord
    ? [...selectedRecord.events].sort((left, right) =>
        left.date < right.date ? 1 : -1,
      )
    : [];
  const deleteCandidate =
    enrichedRecords.find((record) => record.id === deleteCandidateId) ?? null;

  const totalIOwe = enrichedRecords
    .filter(
      (record) => record.direction === "I_OWE" && record.status !== "SETTLED",
    )
    .reduce((sum, record) => sum + record.remaining, 0);

  const totalOwedToMe = enrichedRecords
    .filter(
      (record) => record.direction === "OWES_ME" && record.status !== "SETTLED",
    )
    .reduce((sum, record) => sum + record.remaining, 0);

  const activeCount = enrichedRecords.filter(
    (record) => record.status !== "SETTLED",
  ).length;
  const settledCount = enrichedRecords.filter(
    (record) => record.status === "SETTLED",
  ).length;
  const dueSoonCount = enrichedRecords.filter(
    (record) => record.status === "DUE_SOON" || record.status === "OVERDUE",
  ).length;

  function updateRecord(
    recordId: string,
    updater: (record: DebtRecord) => DebtRecord,
  ) {
    setRecords((current) =>
      current.map((record) =>
        record.id === recordId ? updater(record) : record,
      ),
    );
  }

  function handleActionSubmit() {
    if (!selectedRecord) return;

    const amount = Number(formDraft.amount);
    void amount;

    const eventAmount = Number(actionDraft.amount);
    if (Number.isNaN(eventAmount) || eventAmount <= 0) return;
    if (!actionDraft.date) return;
    if (
      actionDraft.type === "REPAYMENT" &&
      eventAmount > selectedRecord.remaining
    )
      return;

    updateRecord(selectedRecord.id, (record) => ({
      ...record,
      events: [
        ...record.events,
        {
          id: `${record.id}-${Date.now()}`,
          type: actionDraft.type,
          amount: eventAmount,
          date: actionDraft.date,
          note:
            actionDraft.note.trim() ||
            (actionDraft.type === "REPAYMENT"
              ? "Manual repayment entry."
              : "Additional debt amount added."),
        },
      ],
    }));

    setActionDraft((current) => ({
      ...current,
      amount: "",
      note: "",
    }));
  }

  function handleSettleSelected() {
    if (!selectedRecord || selectedRecord.remaining <= 0) return;

    updateRecord(selectedRecord.id, (record) => ({
      ...record,
      events: [
        ...record.events,
        {
          id: `${record.id}-${Date.now()}`,
          type: "REPAYMENT",
          amount: selectedRecord.remaining,
          date: todayIso,
          note: "Marked as settled from Ur Zeel detail panel.",
        },
      ],
    }));
  }

  function handleEditSelected() {
    if (!selectedRecord) return;

    setEditingRecordId(selectedRecord.id);
    setFormDraft({
      direction: selectedRecord.direction,
      person: selectedRecord.person,
      amount: String(selectedRecord.total),
      category: selectedRecord.category,
      reason: selectedRecord.reason,
      note: selectedRecord.note,
      openedAt: selectedRecord.openedAt,
      dueDate: selectedRecord.dueDate,
    });
    setSidePanelTab("FORM");
  }

  function handleDeleteRecord(recordId: string) {
    const nextRecords = records.filter((record) => record.id !== recordId);
    setRecords(nextRecords);
    setEditingRecordId(null);
    setDeleteCandidateId(null);
    setFormDraft(initialFormDraft);
    setSelectedId(nextRecords[0]?.id ?? "");
    setSidePanelTab(nextRecords.length > 0 ? "DETAILS" : "FORM");
  }

  function handleSaveRecord() {
    const amount = Number(formDraft.amount);
    if (!formDraft.person.trim() || !formDraft.reason.trim()) return;
    if (Number.isNaN(amount) || amount <= 0) return;

    if (editingRecordId) {
      updateRecord(editingRecordId, (record) => ({
        ...record,
        person: formDraft.person.trim(),
        direction: formDraft.direction,
        category: formDraft.category,
        reason: formDraft.reason.trim(),
        note: formDraft.note.trim(),
        openedAt: formDraft.openedAt,
        dueDate: formDraft.dueDate,
        events: record.events.map((event, index) =>
          index === 0 && event.type === "CREATE"
            ? {
                ...event,
                amount,
                date: formDraft.openedAt,
                note:
                  formDraft.note.trim() ||
                  (formDraft.direction === "I_OWE"
                    ? "Initial borrowing recorded from the form."
                    : "Initial lending recorded from the form."),
              }
            : event,
        ),
      }));

      setEditingRecordId(null);
      setFormDraft(initialFormDraft);
      setSidePanelTab("DETAILS");
      return;
    }

    const nextRecord: DebtRecord = {
      id: `debt-${Date.now()}`,
      person: formDraft.person.trim(),
      direction: formDraft.direction,
      category: formDraft.category,
      reason: formDraft.reason.trim(),
      note: formDraft.note.trim(),
      openedAt: formDraft.openedAt,
      dueDate: formDraft.dueDate,
      events: [
        {
          id: `debt-${Date.now()}-create`,
          type: "CREATE",
          amount,
          date: formDraft.openedAt,
          note:
            formDraft.note.trim() ||
            (formDraft.direction === "I_OWE"
              ? "Initial borrowing recorded from the form."
              : "Initial lending recorded from the form."),
        },
      ],
    };

    setRecords((current) => [nextRecord, ...current]);
    setSelectedId(nextRecord.id);
    setFormDraft(initialFormDraft);
    setSidePanelTab("DETAILS");
  }

  return (
    <div className="flex w-full flex-col gap-4">
      <section className="panel-surface overflow-hidden rounded-4xl p-4 sm:p-5">
        <div className="space-y-4">
          <div>
            <p className="soft-text text-xs font-semibold uppercase tracking-[0.18em]">
              Ur Zeel
            </p>
            <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h1 className="theme-heading text-3xl font-semibold tracking-[-0.03em]">
                  {copy.heroTitle}
                </h1>
                <p className="soft-text mt-2 max-w-2xl text-sm leading-6">
                  {copy.heroDescription}
                </p>
              </div>
              <div className="theme-user-card theme-text rounded-2xl px-3 py-2 text-sm font-medium">
                {copy.frontendPrototype}
              </div>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              title={copy.totalIOwe}
              value={formatMoney(
                totalIOwe,
                preferences.currency,
                preferences.hideBalances,
              )}
              className="border-transparent bg-linear-to-br from-[#d7a158] via-[#b97b39] to-[#7d4f24] text-white shadow-[0_16px_34px_rgba(96,57,23,0.28)]"
            />
            <StatCard
              title={copy.totalOwedToMe}
              value={formatMoney(
                totalOwedToMe,
                preferences.currency,
                preferences.hideBalances,
              )}
              className="border-transparent bg-linear-to-br from-[#5bb68a] via-[#348f6e] to-[#1f5c4f] text-white shadow-[0_16px_34px_rgba(19,72,57,0.28)]"
            />
            <StatCard
              title={copy.netPosition}
              value={formatMoney(
                totalOwedToMe - totalIOwe,
                preferences.currency,
                preferences.hideBalances,
              )}
              className="border-transparent bg-linear-to-br from-[#4d8f96] via-[#2f6d77] to-[#1b424e] text-white shadow-[0_16px_34px_rgba(15,49,58,0.28)]"
            />
            <StatCard
              title={copy.dueSoon}
              value={`${dueSoonCount}`}
              className="border-transparent bg-linear-to-br from-[#7b8d73] via-[#4d6958] to-[#2a3f38] text-white shadow-[0_16px_34px_rgba(24,40,32,0.28)]"
            />
          </div>
        </div>
      </section>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_390px]">
        <div className="space-y-4">
          <section className="panel-surface rounded-[28px] p-4 sm:p-5">
            <div className="flex flex-col gap-4">
              <SectionTitle
                eyebrow={copy.ledgerEyebrow}
                title={copy.ledgerTitle}
                description={copy.ledgerDescription}
              />

              <div className="theme-surface-soft rounded-3xl p-3 sm:p-4">
                <div className="flex flex-col gap-3">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-2.5">
                    <div className="theme-user-card theme-text rounded-xl px-3 py-2 text-sm font-medium">
                      {activeCount} {copy.active}
                      <span className="theme-muted mx-1.5">•</span>
                      {settledCount} {copy.settled}
                    </div>

                    <div className="relative min-w-0 flex-1 sm:min-w-70">
                      <Search
                        size={16}
                        className="theme-icon pointer-events-none absolute left-3 top-1/2 -translate-y-1/2"
                      />
                      <Input
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        placeholder={copy.searchPlaceholder}
                        className="theme-input w-full rounded-xl py-2.5 pl-9 pr-3 text-sm outline-none"
                      />
                    </div>
                  </div>
                </div>

                <PillTabs
                  active={filter}
                  onChange={(value) => setFilter(value as DebtFilter)}
                  tabs={[
                    { label: copy.filterActive, value: "ACTIVE" },
                    { label: copy.filterIOwe, value: "I_OWE" },
                    { label: copy.filterOwesMe, value: "OWES_ME" },
                    { label: copy.filterDueSoon, value: "DUE_SOON" },
                    { label: copy.filterSettled, value: "SETTLED" },
                  ]}
                  containerClassName="theme-surface-soft grid w-full gap-1 rounded-xl p-1 sm:grid-cols-5"
                  buttonBaseClassName="cursor-pointer rounded-lg px-3 py-2 text-sm font-medium"
                />

                <div className="flex flex-wrap items-center gap-2">
                  <span className="theme-muted px-1 text-xs font-semibold uppercase tracking-[0.14em]">
                    {copy.category}
                  </span>
                  {(
                    [
                      "ALL",
                      "Family",
                      "Friends",
                      "Work",
                      "Emergency",
                      "Business",
                      "Other",
                    ] as const
                  ).map((item) => (
                    <Button
                      key={item}
                      onClick={() => setCategory(item)}
                      className={`rounded-xl px-3 py-2 text-sm font-medium ${
                        category === item
                          ? "theme-chip theme-chip-active"
                          : "theme-chip"
                      }`}>
                      {item === "ALL" ? copy.all : item}
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-4 grid gap-3">
              {filteredRecords.length === 0 ? (
                <div className="theme-empty-state rounded-2xl px-4 py-8 text-center text-sm">
                  {copy.noDebtRecordMatches}
                </div>
              ) : (
                filteredRecords.map((record) => (
                  <Button
                    key={record.id}
                    onClick={() => {
                      setSelectedId(record.id);
                      setSidePanelTab("DETAILS");
                    }}
                    className={`theme-card-default rounded-3xl px-4 py-3.5 text-left transition ${
                      selectedId === record.id
                        ? "border-(--chip-border) bg-(--surface-soft) shadow-[0_14px_28px_rgba(20,66,60,0.10)]"
                        : "hover:bg-(--surface-soft)"
                    }`}>
                    <div className="flex gap-3">
                      <div
                        className={`hidden w-1.5 shrink-0 rounded-full sm:block ${
                          record.direction === "I_OWE"
                            ? "bg-[#d19a4f]"
                            : "bg-[#4ba17a]"
                        }`}
                      />

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <span
                                className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${getDirectionTone(record.direction)}`}>
                                {getDirectionLabel(
                                  record.direction,
                                  preferences.language,
                                )}
                              </span>
                              <span
                                className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${getStatusTone(record.status)}`}>
                                {getStatusLabel(
                                  record.status,
                                  preferences.language,
                                )}
                              </span>
                              <span className="theme-chip rounded-full px-2.5 py-1 text-xs font-semibold">
                                {record.category}
                              </span>
                            </div>

                            <h3 className="theme-heading mt-3 text-lg font-semibold">
                              {record.person}
                            </h3>
                            <p className="soft-text mt-1 text-[13px] leading-5">
                              {record.reason}
                            </p>
                          </div>

                          <div className="shrink-0 text-left lg:text-right">
                            <p className="theme-muted text-xs font-semibold uppercase tracking-[0.14em]">
                              {copy.remaining}
                            </p>
                            <p className="theme-heading mt-1 text-base font-semibold sm:text-lg">
                              {formatMoney(
                                record.remaining,
                                preferences.currency,
                                preferences.hideBalances,
                              )}
                            </p>
                            <p className="soft-text mt-1 text-xs">
                              {copy.from}{" "}
                              {formatMoney(
                                record.total,
                                preferences.currency,
                                preferences.hideBalances,
                              )}
                            </p>
                          </div>
                        </div>

                        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-(--chip-border)">
                          <div
                            className={`h-full rounded-full ${
                              record.direction === "I_OWE"
                                ? "bg-linear-to-r from-[#d19a4f] to-[#9f6b35]"
                                : "bg-linear-to-r from-[#4ba17a] to-[#2d7d65]"
                            }`}
                            style={{
                              width: `${Math.max(
                                0,
                                Math.min(
                                  100,
                                  (record.paid / Math.max(record.total, 1)) *
                                    100,
                                ),
                              )}%`,
                            }}
                          />
                        </div>

                        <div className="mt-3 grid gap-2 text-sm sm:grid-cols-2 xl:grid-cols-4">
                          <div className="theme-card-default rounded-xl px-2.5 py-2">
                            <p className="theme-muted text-[10px] font-semibold uppercase tracking-[0.12em]">
                              {copy.due}
                            </p>
                            <p className="theme-text mt-1 inline-flex items-center gap-1.5 text-[13px] font-medium">
                              <CalendarClock size={13} />
                              {formatShortDate(record.dueDate, locale)}
                            </p>
                          </div>

                          <div className="theme-card-default rounded-xl px-2.5 py-2">
                            <p className="theme-muted text-[10px] font-semibold uppercase tracking-[0.12em]">
                              {copy.paid}
                            </p>
                            <p className="theme-text mt-1 inline-flex items-center gap-1.5 text-[13px] font-medium">
                              <HandCoins size={13} />
                              {formatMoney(
                                record.paid,
                                preferences.currency,
                                preferences.hideBalances,
                              )}
                            </p>
                          </div>

                          <div className="theme-card-default rounded-xl px-2.5 py-2">
                            <p className="theme-muted text-[10px] font-semibold uppercase tracking-[0.12em]">
                              {copy.last}
                            </p>
                            <p className="theme-text mt-1 inline-flex items-center gap-1.5 text-[13px] font-medium">
                              <ShieldCheck size={13} />
                              {formatShortDate(record.lastEvent.date, locale)}
                            </p>
                          </div>

                          <div className="theme-card-default rounded-xl px-2.5 py-2">
                            <p className="theme-muted text-[10px] font-semibold uppercase tracking-[0.12em]">
                              {copy.events}
                            </p>
                            <p className="theme-text mt-1 inline-flex items-center gap-1.5 text-[13px] font-medium">
                              <UserRound size={13} />
                              {record.events.length} {copy.eventCount}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Button>
                ))
              )}
            </div>
          </section>
        </div>

        <div className="space-y-4 xl:sticky xl:top-6 xl:h-fit xl:self-start">
          <section className="panel-surface overflow-hidden rounded-[30px]">
            <div className="border-b border-(--surface-line) px-4 py-4 sm:px-5">
              <div className="flex flex-col gap-4">
                <SectionTitle
                  eyebrow={copy.sidePanelEyebrow}
                  title={
                    sidePanelTab === "DETAILS"
                      ? selectedRecord
                        ? selectedRecord.person
                        : copy.noRecordSelected
                      : editingRecordId
                        ? copy.editDebtRecord
                        : copy.addBorrowedOrLentMoney
                  }
                  description={
                    sidePanelTab === "DETAILS"
                      ? selectedRecord
                        ? selectedRecord.note || selectedRecord.reason
                        : copy.chooseRecord
                      : editingRecordId
                        ? copy.updatePersonAmountDue
                        : copy.createDebtCase
                  }
                />

                <PillTabs
                  active={sidePanelTab}
                  onChange={(value) => setSidePanelTab(value as SidePanelTab)}
                  tabs={[
                    { label: copy.details, value: "DETAILS" },
                    {
                      label: editingRecordId ? copy.edit : copy.newRecord,
                      value: "FORM",
                    },
                  ]}
                  containerClassName="theme-surface-soft grid w-full grid-cols-2 gap-1 rounded-xl p-1"
                />
              </div>
            </div>

            <div className="max-h-[calc(100vh-10rem)] overflow-y-auto px-4 py-4 sm:px-5">
              {sidePanelTab === "DETAILS" && selectedRecord ? (
                <div className="space-y-4">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="theme-surface-soft rounded-2xl p-3">
                      <p className="theme-muted text-xs font-semibold uppercase tracking-[0.14em]">
                        {copy.remaining}
                      </p>
                      <p className="theme-heading mt-2 text-xl font-semibold">
                        {formatMoney(
                          selectedRecord.remaining,
                          preferences.currency,
                          preferences.hideBalances,
                        )}
                      </p>
                    </div>
                    <div className="theme-surface-soft rounded-2xl p-3">
                      <p className="theme-muted text-xs font-semibold uppercase tracking-[0.14em]">
                        {copy.dueDate}
                      </p>
                      <p className="theme-heading mt-2 text-xl font-semibold">
                        {formatShortDate(selectedRecord.dueDate, locale)}
                      </p>
                    </div>
                  </div>

                  <div className="theme-card-default rounded-2xl p-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${getDirectionTone(selectedRecord.direction)}`}>
                        {getDirectionLabel(
                          selectedRecord.direction,
                          preferences.language,
                        )}
                      </span>
                      <span
                        className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${getStatusTone(selectedRecord.status)}`}>
                        {getStatusLabel(
                          selectedRecord.status,
                          preferences.language,
                        )}
                      </span>
                      <span className="theme-chip rounded-full px-2.5 py-1 text-xs font-semibold">
                        {selectedRecord.category}
                      </span>
                    </div>

                    <div className="theme-muted mt-4 grid gap-2 text-sm">
                      <p className="inline-flex items-center gap-2">
                        {selectedRecord.direction === "I_OWE" ? (
                          <ArrowDownLeft size={15} />
                        ) : (
                          <ArrowUpRight size={15} />
                        )}
                        {selectedRecord.reason}
                      </p>
                      <p className="inline-flex items-center gap-2">
                        <Clock3 size={15} />
                        {copy.started}{" "}
                        {formatShortDate(selectedRecord.openedAt, locale)}
                      </p>
                      <p className="inline-flex items-center gap-2">
                        <NotebookPen size={15} />
                        {selectedRecord.note || copy.noExtraNote}
                      </p>
                    </div>
                  </div>

                  <div className="theme-surface-soft rounded-2xl p-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <p className="theme-heading text-sm font-semibold">
                        {copy.updateDebtRecord}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        <Button
                          onClick={handleEditSelected}
                          className="theme-button-secondary inline-flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm font-medium">
                          <NotebookPen size={15} />
                          {copy.edit}
                        </Button>
                        <Button
                          onClick={() =>
                            setDeleteCandidateId(selectedRecord.id)
                          }
                          className="theme-status-error rounded-xl px-3 py-2 text-sm font-medium">
                          {copy.delete}
                        </Button>
                        <Button
                          onClick={handleSettleSelected}
                          disabled={selectedRecord.remaining <= 0}
                          className="theme-button-secondary inline-flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-60">
                          <CheckCircle2 size={15} />
                          {copy.settle}
                        </Button>
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      <Button
                        onClick={() =>
                          setActionDraft((current) => ({
                            ...current,
                            type: "REPAYMENT",
                          }))
                        }
                        className={`rounded-xl px-3 py-2 text-sm font-medium ${
                          actionDraft.type === "REPAYMENT"
                            ? "theme-chip theme-chip-active"
                            : "theme-chip"
                        }`}>
                        {copy.addRepayment}
                      </Button>
                      <Button
                        onClick={() =>
                          setActionDraft((current) => ({
                            ...current,
                            type: "ADDITIONAL",
                          }))
                        }
                        className={`rounded-xl px-3 py-2 text-sm font-medium ${
                          actionDraft.type === "ADDITIONAL"
                            ? "theme-chip theme-chip-active"
                            : "theme-chip"
                        }`}>
                        {copy.addMore}
                      </Button>
                    </div>

                    <div className="mt-4 grid gap-3">
                      <Input
                        value={actionDraft.amount}
                        onChange={(event) =>
                          setActionDraft((current) => ({
                            ...current,
                            amount: event.target.value,
                          }))
                        }
                        inputMode="numeric"
                        placeholder={copy.amount}
                        className="theme-input w-full rounded-xl px-3 py-2.5 text-sm outline-none"
                      />
                      <Input
                        type="date"
                        value={actionDraft.date}
                        onChange={(event) =>
                          setActionDraft((current) => ({
                            ...current,
                            date: event.target.value,
                          }))
                        }
                        className="theme-input w-full rounded-xl px-3 py-2.5 text-sm outline-none"
                      />
                      <textarea
                        value={actionDraft.note}
                        onChange={(event) =>
                          setActionDraft((current) => ({
                            ...current,
                            note: event.target.value,
                          }))
                        }
                        rows={3}
                        placeholder={copy.actionPlaceholder}
                        className="theme-input w-full resize-none rounded-xl px-3 py-2.5 text-sm outline-none"
                      />
                    </div>

                    <Button
                      onClick={handleActionSubmit}
                      className="theme-button-primary mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold">
                      <Plus size={16} />
                      {copy.saveEvent}
                    </Button>
                  </div>

                  <div className="theme-surface-soft rounded-2xl p-4">
                    <p className="theme-heading text-sm font-semibold">
                      {copy.timeline}
                    </p>
                    <div className="mt-4 space-y-3">
                      {selectedTimeline.map((event, index) => (
                        <div key={event.id} className="relative pl-6">
                          {index !== selectedTimeline.length - 1 ? (
                            <span className="absolute left-2.75 top-6 h-[calc(100%-8px)] w-px bg-(--surface-line)" />
                          ) : null}
                          <span className="absolute left-0 top-1.5 h-5.5 w-5.5 rounded-full border border-(--surface-line) bg-(--surface-solid) shadow-sm" />
                          <div className="theme-card-default rounded-2xl px-3 py-3">
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <p className="theme-heading text-sm font-semibold">
                                  {getDirectionEventLabel(
                                    selectedRecord.direction,
                                    event.type,
                                    preferences.language,
                                  )}
                                </p>
                                <p className="soft-text text-xs">
                                  {formatShortDate(event.date, locale)}
                                </p>
                              </div>
                              <p className="theme-heading text-sm font-semibold">
                                {formatMoney(
                                  event.amount,
                                  preferences.currency,
                                  preferences.hideBalances,
                                )}
                              </p>
                            </div>
                            <p className="soft-text mt-2 text-sm leading-6">
                              {event.note}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : null}

              {sidePanelTab === "FORM" ? (
                <div className="space-y-4">
                  <div className="theme-surface-soft rounded-2xl p-4">
                    <div className="flex flex-wrap gap-2">
                      <Button
                        onClick={() =>
                          setFormDraft((current) => ({
                            ...current,
                            direction: "I_OWE",
                          }))
                        }
                        className={`rounded-xl px-3 py-2 text-sm font-medium ${
                          formDraft.direction === "I_OWE"
                            ? "theme-chip theme-chip-active"
                            : "theme-chip"
                        }`}>
                        {copy.iBorrowed}
                      </Button>
                      <Button
                        onClick={() =>
                          setFormDraft((current) => ({
                            ...current,
                            direction: "OWES_ME",
                          }))
                        }
                        className={`rounded-xl px-3 py-2 text-sm font-medium ${
                          formDraft.direction === "OWES_ME"
                            ? "theme-chip theme-chip-active"
                            : "theme-chip"
                        }`}>
                        {copy.iLent}
                      </Button>
                    </div>

                    <div className="mt-4 grid gap-3">
                      <Input
                        value={formDraft.person}
                        onChange={(event) =>
                          setFormDraft((current) => ({
                            ...current,
                            person: event.target.value,
                          }))
                        }
                        placeholder={copy.personName}
                        className="theme-input w-full rounded-xl px-3 py-2.5 text-sm outline-none"
                      />
                      <Input
                        value={formDraft.amount}
                        onChange={(event) =>
                          setFormDraft((current) => ({
                            ...current,
                            amount: event.target.value,
                          }))
                        }
                        inputMode="numeric"
                        placeholder={copy.amount}
                        className="theme-input w-full rounded-xl px-3 py-2.5 text-sm outline-none"
                      />
                      <select
                        value={formDraft.category}
                        onChange={(event) =>
                          setFormDraft((current) => ({
                            ...current,
                            category: event.target.value as DebtCategory,
                          }))
                        }
                        className="theme-input w-full rounded-xl px-3 py-2.5 text-sm outline-none">
                        <option value="Family">Family</option>
                        <option value="Friends">Friends</option>
                        <option value="Work">Work</option>
                        <option value="Emergency">Emergency</option>
                        <option value="Business">Business</option>
                        <option value="Other">Other</option>
                      </select>
                      <Input
                        value={formDraft.reason}
                        onChange={(event) =>
                          setFormDraft((current) => ({
                            ...current,
                            reason: event.target.value,
                          }))
                        }
                        placeholder={copy.reasonPlaceholder}
                        className="theme-input w-full rounded-xl px-3 py-2.5 text-sm outline-none"
                      />
                      <div className="grid gap-3 sm:grid-cols-2">
                        <Input
                          type="date"
                          value={formDraft.openedAt}
                          onChange={(event) =>
                            setFormDraft((current) => ({
                              ...current,
                              openedAt: event.target.value,
                            }))
                          }
                          className="theme-input w-full rounded-xl px-3 py-2.5 text-sm outline-none"
                        />
                        <Input
                          type="date"
                          value={formDraft.dueDate}
                          onChange={(event) =>
                            setFormDraft((current) => ({
                              ...current,
                              dueDate: event.target.value,
                            }))
                          }
                          className="theme-input w-full rounded-xl px-3 py-2.5 text-sm outline-none"
                        />
                      </div>
                      <textarea
                        value={formDraft.note}
                        onChange={(event) =>
                          setFormDraft((current) => ({
                            ...current,
                            note: event.target.value,
                          }))
                        }
                        rows={3}
                        placeholder={copy.notePlaceholder}
                        className="theme-input w-full resize-none rounded-xl px-3 py-2.5 text-sm outline-none"
                      />
                    </div>

                    <div className="mt-4 grid gap-2 sm:grid-cols-2">
                      <Button
                        onClick={handleSaveRecord}
                        className="theme-button-primary inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold">
                        <Plus size={16} />
                        {editingRecordId
                          ? copy.saveChanges
                          : copy.addDebtRecord}
                      </Button>
                      {editingRecordId ? (
                        <Button
                          onClick={() => {
                            setEditingRecordId(null);
                            setFormDraft(initialFormDraft);
                            setSidePanelTab("DETAILS");
                          }}
                          className="theme-button-secondary rounded-xl px-4 py-3 text-sm font-medium">
                          {copy.cancelEdit}
                        </Button>
                      ) : null}
                    </div>
                  </div>

                  <div className="theme-surface-soft rounded-2xl p-4">
                    <p className="theme-heading text-sm font-semibold">
                      {copy.formNotes}
                    </p>
                    <div className="theme-muted mt-3 grid gap-2 text-sm">
                      <p className="inline-flex items-start gap-2">
                        <ArrowDownLeft size={15} className="mt-0.5 shrink-0" />
                        {copy.borrowedHint}
                      </p>
                      <p className="inline-flex items-start gap-2">
                        <ArrowUpRight size={15} className="mt-0.5 shrink-0" />
                        {copy.lentHint}
                      </p>
                      <p className="inline-flex items-start gap-2">
                        <ShieldCheck size={15} className="mt-0.5 shrink-0" />
                        {copy.syncHint}
                      </p>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          </section>
        </div>
      </div>

      <Modal
        open={Boolean(deleteCandidate)}
        onClose={() => setDeleteCandidateId(null)}
        overlayClassName="fixed inset-0 z-50 flex items-center justify-center bg-[#0f221d]/30 px-4 backdrop-blur-[2px]"
        panelClassName="theme-card-default w-full max-w-md rounded-[28px] p-5 shadow-[0_24px_60px_rgba(17,54,47,0.22)]"
        footer={
          deleteCandidate ? (
            <div className="mt-5 flex justify-end gap-2">
              <Button
                onClick={() => setDeleteCandidateId(null)}
                className="theme-button-secondary rounded-xl px-4 py-2.5 text-sm font-medium">
                {copy.cancel}
              </Button>
              <Button
                onClick={() => handleDeleteRecord(deleteCandidate.id)}
                className="theme-status-error rounded-xl px-4 py-2.5 text-sm font-medium">
                {copy.delete}
              </Button>
            </div>
          ) : null
        }>
        {deleteCandidate ? (
          <>
            <p className="theme-muted text-xs font-semibold uppercase tracking-[0.16em]">
              {copy.deleteRecord}
            </p>
            <h3 className="theme-heading mt-2 text-xl font-semibold">
              {copy.removePerson.replace("{{person}}", deleteCandidate.person)}
            </h3>
            <p className="soft-text mt-2 text-sm leading-6">
              {copy.deleteDescription}
            </p>
          </>
        ) : null}
      </Modal>
    </div>
  );
}
