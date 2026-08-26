"use client";

import { useEffect, useMemo, useState } from "react";

const monthNames = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
const weekDays = ["Domingo", "Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado"];
const calendarWeekDays = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado", "Domingo"];
const paymentGoal = 250;
const basePayment = 5000;
const extraRate = 5;
const currency = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

type DayValue = number | "off";
type Records = Record<string, Record<string, DayValue>>;

const monthKey = (year: number, month: number) =>
  `${year}-${String(month + 1).padStart(2, "0")}`;

const importedRecords: Records = {
  "2025-12": {"1":16,"2":20,"3":14,"4":15,"5":16,"8":16,"9":23,"10":2,"11":14,"12":16,"15":20,"16":27,"17":23,"18":23,"19":39,"22":25,"23":16,"24":22,"25":"off","26":22,"29":28,"30":21,"31":16},
  "2026-01": {"1":"off","2":25,"5":27,"6":23,"7":19,"8":25,"9":25,"12":16,"13":32,"14":15,"15":19,"16":19,"19":25,"20":17,"21":10,"22":17,"23":13,"26":19,"27":24,"28":8,"29":24,"30":15},
  "2026-02": {"2":19,"3":18,"4":22,"5":29,"6":24,"9":19,"10":15,"11":16,"12":23,"13":22,"16":26,"17":10,"18":0,"19":19,"20":20,"23":25,"24":20,"25":15,"26":21,"27":14},
  "2026-03": {"2":36,"3":20,"4":14,"5":27,"6":18,"9":26,"10":18,"11":13,"12":20,"13":20,"16":19,"17":10,"18":17,"19":24,"20":19,"23":18,"24":22,"25":31,"26":31,"27":17,"30":31,"31":23},
  "2026-04": {"1":30,"2":31,"3":"off","6":39,"7":18,"8":22,"9":23,"10":23,"13":15,"14":32,"15":11,"16":20,"17":22,"20":17,"21":"off","22":28,"23":22,"24":22,"27":25,"28":28,"29":15,"30":16},
  "2026-05": {"1":"off","4":23,"5":24,"6":22,"7":22,"8":22,"11":27,"12":35,"13":16,"14":28,"15":23,"18":25,"19":21,"20":32,"21":27,"22":17,"25":23,"26":14,"27":4,"28":19,"29":17},
  "2026-06": {"1":26,"2":19,"3":20,"4":"off","5":"off","8":"off","9":"off","10":15,"11":22,"12":26,"15":41,"16":13,"17":21,"18":20,"19":21,"22":36,"23":20,"24":22,"25":20,"26":15,"29":19,"30":34},
  "2026-07": {"1":23,"2":27,"3":28,"6":33,"7":22,"8":22,"9":17,"10":24,"13":19,"14":15,"15":14,"16":28,"17":20,"20":26,"21":30,"22":20,"23":24,"24":20,"27":20,"28":21,"29":22,"30":20,"31":16},
  "2026-08": {"3":17,"4":16,"5":39,"6":32,"7":20,"10":21,"11":19,"12":18,"13":24,"14":"off"},
};

export default function Home() {
  const [year, setYear] = useState(2026);
  const [month, setMonth] = useState(7);
  const [records, setRecords] = useState<Records>(importedRecords);
  const [ready, setReady] = useState(false);
  const [today, setToday] = useState<{
    year: number;
    month: number;
    day: number;
  } | null>(null);

  useEffect(() => {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: "America/Sao_Paulo",
      year: "numeric",
      month: "numeric",
      day: "numeric",
    }).formatToParts(new Date());

    const part = (type: string) =>
      Number(parts.find((item) => item.type === type)?.value);

    setToday({
      year: part("year"),
      month: part("month") - 1,
      day: part("day"),
    });

    const saved = localStorage.getItem("atendimentos-diarios-v2");

    if (saved) {
      try {
        setRecords((base) => ({
          ...base,
          ...JSON.parse(saved),
        }));
      } catch {
        /* mantém o histórico importado */
      }
    }

    setReady(true);
  }, []);

  useEffect(() => {
    if (ready) {
      localStorage.setItem(
        "atendimentos-diarios-v2",
        JSON.stringify(records),
      );
    }
  }, [records, ready]);

  const key = monthKey(year, month);
  const monthRecords = records[key] ?? {};
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const todayStart = today
    ? new Date(today.year, today.month, today.day).getTime()
    : null;

  const days = useMemo(
    () =>
      Array.from({ length: daysInMonth }, (_, i) => {
        const day = i + 1;
        const weekDay = new Date(year, month, day).getDay();
        const dayTime = new Date(year, month, day).getTime();

        return {
          day,
          label: weekDays[weekDay],
          weekend: weekDay === 0 || weekDay === 6,
          weekendClass:
            weekDay === 6
              ? "saturday"
              : weekDay === 0
                ? "sunday"
                : "",
          temporalClass:
            todayStart === null
              ? ""
              : dayTime < todayStart
                ? "pastDay"
                : dayTime === todayStart
                  ? "today"
                  : "futureDay",
        };
      }),
    [year, month, daysInMonth, todayStart],
  );

  const numericValues = Object.values(monthRecords).filter(
    (value): value is number => typeof value === "number",
  );

  const total = numericValues.reduce((sum, value) => sum + value, 0);
  const workedDays = numericValues.length;
  const completedDays = Object.keys(monthRecords).length;
  const businessDays = days.filter((item) => !item.weekend).length;
  const average = workedDays ? Math.round(total / workedDays) : 0;

  const progress = businessDays
    ? Math.min(100, Math.round((completedDays / businessDays) * 100))
    : 0;

  const remainingForPayment = Math.max(0, paymentGoal - total);
  const extraAttendances = Math.max(0, total - paymentGoal);

  const estimatedPayment =
    total >= paymentGoal
      ? basePayment + extraAttendances * extraRate
      : 0;

  const paymentProgress = Math.min(
    100,
    Math.round((total / paymentGoal) * 100),
  );

  const history = Object.keys(records)
    .sort()
    .map((period) => {
      const [itemYear, itemMonth] = period.split("-").map(Number);

      const values = Object.values(records[period]).filter(
        (value): value is number => typeof value === "number",
      );

      return {
        period,
        year: itemYear,
        month: itemMonth - 1,
        total: values.reduce((sum, value) => sum + value, 0),
      };
    });

  function setDay(day: number, value?: DayValue) {
    const nextMonth = { ...monthRecords };

    if (value === undefined) {
      delete nextMonth[String(day)];
    } else {
      nextMonth[String(day)] = value;
    }

    setRecords((current) => ({
      ...current,
      [key]: nextMonth,
    }));
  }

  function updateDay(day: number, raw: string) {
    setDay(
      day,
      raw === ""
        ? undefined
        : Math.max(0, Number.parseInt(raw, 10) || 0),
    );
  }

  function changeMonth(offset: number) {
    const next = new Date(year, month + offset, 1);
    setYear(next.getFullYear());
    setMonth(next.getMonth());
  }

  function selectMonth(itemYear: number, itemMonth: number) {
    setYear(itemYear);
    setMonth(itemMonth);
  }

  function goToday() {
    if (today) {
      setYear(today.year);
      setMonth(today.month);
    }
  }

  return (
    <main>
      <header className="topbar">
        <div className="brand">
          <span className="brandMark">LD</span>

          <div>
            <strong>Meu Controle</strong>
            <small>Atendimentos diários</small>
          </div>
        </div>

        <button className="todayButton" onClick={goToday}>
          Ir para o mês atual
        </button>
      </header>

      <div className="shell">
        <section className="hero">
          <div>
            <p className="eyebrow">PAINEL MENSAL</p>

            <h1>
              Acompanhe seu ritmo,
              <br />
              <span>um dia de cada vez.</span>
            </h1>

            <p className="intro">
              Seu histórico da planilha, agora em um painel simples para
              lançar e acompanhar cada atendimento.
            </p>
          </div>

          <div className="monthPicker" aria-label="Selecionar mês">
            <button
              onClick={() => changeMonth(-1)}
              aria-label="Mês anterior"
            >
              ←
            </button>

            <div>
              <small>PERÍODO</small>
              <strong>
                {monthNames[month]} {year}
              </strong>
            </div>

            <button
              onClick={() => changeMonth(1)}
              aria-label="Próximo mês"
            >
              →
            </button>
          </div>
        </section>

        <section className="stats" aria-label="Resumo do mês">
          <article className="stat primary">
            <span>Total no mês</span>
            <strong>{total}</strong>
            <small>atendimentos registrados</small>
          </article>

          <article className="stat">
            <span>Média por dia</span>
            <strong>{average}</strong>
            <small>nos dias trabalhados</small>
          </article>

          <article className="stat">
            <span>Dias concluídos</span>

            <strong>
              {completedDays}
              <em>/{businessDays}</em>
            </strong>

            <small>incluindo folgas e feriados</small>
          </article>

          <article className="stat progressCard">
            <span>Progresso do mês</span>
            <strong>{progress}%</strong>

            <div className="progress">
              <i style={{ width: `${progress}%` }} />
            </div>
          </article>
        </section>

        <section
          className={`finance ${
            total >= paymentGoal ? "goalReached" : ""
          }`}
          aria-label="Acompanhamento financeiro"
        >
          <div className="financeIntro">
            <p className="eyebrow">ACOMPANHAMENTO FINANCEIRO</p>
            <h2>{currency.format(estimatedPayment)}</h2>
            <span>valor estimado no mês</span>
          </div>

          <div className="financeProgress">
            <div className="financeProgressHead">
              <strong>
                {total} de {paymentGoal}
              </strong>

              <span>{paymentProgress}% da meta-base</span>
            </div>

            <div className="moneyBar">
              <i style={{ width: `${paymentProgress}%` }} />
            </div>

            <p>
              {remainingForPayment > 0 ? (
                <>
                  Faltam <strong>{remainingForPayment} atendimentos</strong>{" "}
                  para liberar {currency.format(basePayment)}.
                </>
              ) : (
                <>
                  Meta-base alcançada. Cada novo atendimento acrescenta{" "}
                  <strong>{currency.format(extraRate)}</strong>.
                </>
              )}
            </p>
          </div>

          <div className="financeDetails">
            <div>
              <span>Valor-base</span>
              <strong>{currency.format(basePayment)}</strong>
              <small>ao atingir {paymentGoal}</small>
            </div>

            <div>
              <span>Excedentes</span>
              <strong>{extraAttendances}</strong>

              <small>
                {currency.format(extraAttendances * extraRate)} adicionais
              </small>
            </div>
          </div>
        </section>

        <section className="history" aria-label="Histórico importado">
          <div>
            <p className="eyebrow">HISTÓRICO IMPORTADO</p>
            <span>Escolha um mês</span>
          </div>

          <div className="historyMonths">
            {history.map((item) => (
              <button
                className={item.period === key ? "active" : ""}
                key={item.period}
                onClick={() => selectMonth(item.year, item.month)}
              >
                <span>{monthNames[item.month].slice(0, 3)}</span>
                <strong>{item.total}</strong>
                <small>{item.year}</small>
              </button>
            ))}
          </div>
        </section>

        <section className="register">
          <div className="sectionHead">
            <div>
              <p className="eyebrow">LANÇAMENTOS</p>
              <h2>
                {monthNames[month]} de {year}
              </h2>
            </div>

            <div className="sectionActions">
              <div className="dateLegend">
                <span className="pastLegend">
                  <i />
                  Passado
                </span>

                <span className="todayLegend">
                  <i />
                  Hoje
                </span>

                <span className="futureLegend">
                  <i />
                  Próximos
                </span>
              </div>

              <span className="saveStatus">
                <i /> Salvo automaticamente
              </span>
            </div>
          </div>

          <div className="calendarViewport">
            <div className="weekHeader" aria-hidden="true">
              {calendarWeekDays.map((label, index) => (
                <span
                  className={index > 4 ? "weekendHeader" : ""}
                  key={label}
                >
                  {label}
                </span>
              ))}
            </div>

            <div className="dayGrid">
              {days.map(
                (
                  {
                    day,
                    label,
                    weekend,
                    weekendClass,
                    temporalClass,
                  },
                  index,
                ) => {
                  const value = monthRecords[String(day)];
                  const isOff = value === "off";

                  const firstDayColumn =
                    ((new Date(year, month, 1).getDay() + 6) % 7) + 1;

                  return (
                    <article
                      className={`dayCard ${weekendClass} ${temporalClass} ${
                        isOff ? "offDay" : ""
                      }`}
                      style={
                        index === 0
                          ? { gridColumnStart: firstDayColumn }
                          : undefined
                      }
                      key={day}
                    >
                      <div className="dateBlock">
                        <strong>{String(day).padStart(2, "0")}</strong>
                        <span>{label}</span>
                      </div>

                      {weekend ? (
                        <span className="rest">Fim de semana</span>
                      ) : isOff ? (
                        <button
                          className="rest offActive"
                          onClick={() => setDay(day)}
                          aria-label={`Remover folga do dia ${day}`}
                        >
                          Folga / feriado ×
                        </button>
                      ) : (
                        <div className="entry">
                          <label>
                            <span className="srOnly">
                              Atendimentos no dia {day}
                            </span>

                            <input
                              type="number"
                              min="0"
                              inputMode="numeric"
                              placeholder="—"
                              value={
                                typeof value === "number" ? value : ""
                              }
                              onChange={(event) =>
                                updateDay(day, event.target.value)
                              }
                            />

                            <small>atend.</small>
                          </label>

                          <button
                            className="offToggle"
                            onClick={() => setDay(day, "off")}
                            aria-label={`Marcar dia ${day} como folga ou feriado`}
                          >
                            Folga
                          </button>
                        </div>
                      )}
                    </article>
                  );
                },
              )}
            </div>
          </div>
        </section>

        <footer>
          Histórico importado de "Atend. Diários.xlsx". Novos lançamentos
          ficam salvos neste navegador.
        </footer>
      </div>
    </main>
  );
}
