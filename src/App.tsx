import { useQueryClient } from "@tanstack/react-query";
import {
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
  type ReactNode,
  type RefObject,
} from "react";
import { useReactToPrint } from "react-to-print";
import {
  checkInviteInviteGet,
  getListGradesApiV1GradeQuizIdGetQueryKey,
  getListQuizzesApiV1QuizGetQueryKey,
  useCreateQuizApiV1QuizPost,
  useGetQuizApiV1QuizQuizIdGet,
  useGradeQuizApiV1GradeQuizIdPost,
  useListGradesApiV1GradeQuizIdGet,
  useListQuizzesApiV1QuizGet,
  type GradeResponse,
  type ProblemPublic,
} from "./api/generated";
import generateCardImage from "./assets/figma/generate-card.png";
import gradingCardImage from "./assets/figma/grading-card.png";
import heroBackground from "./assets/figma/hero-bg.png";
import viewCardImage from "./assets/figma/view-card.png";
import { Icon } from "./components/Icons";
import {
  clearInviteCode,
  setInviteCode as persistInviteCode,
} from "./services/api";

type Screen = "invite" | "main" | "generate" | "view" | "grading";
type GenerationState = "empty" | "filled" | "generated";

const printPageStyle = `
  @page {
    size: A4;
    margin: 0;
  }

  html,
  body {
    margin: 0 !important;
    width: 210mm;
    min-height: 297mm;
    background: #ffffff !important;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }

  .test-paper {
    width: 210mm !important;
    height: 297mm !important;
    min-height: 297mm !important;
    border: 0 !important;
    border-radius: 0 !important;
    box-shadow: none !important;
  }

  .paper-actions {
    display: none !important;
  }
`;

function formatFileSize(size: number) {
  if (size < 1024) return `${size}B`;
  if (size < 1024 * 1024) return `${Math.round(size / 1024)}KB`;
  return `${(size / 1024 / 1024).toFixed(1)}MB`;
}

function App() {
  const queryClient = useQueryClient();

  const [screen, setScreen] = useState<Screen>("invite");
  const [inviteCode, setInviteCode] = useState("");
  const [isCheckingInvite, setIsCheckingInvite] = useState(false);
  const [inviteError, setInviteError] = useState<string | null>(null);

  const [examName, setExamName] = useState("");
  const [problemFile, setProblemFile] = useState<File | null>(null);
  const [gradingFile, setGradingFile] = useState<File | null>(null);
  const [generationState, setGenerationState] =
    useState<GenerationState>("empty");
  const [selectedExamId, setSelectedExamId] = useState<string | null>(null);
  const [selectedGradingExamId, setSelectedGradingExamId] = useState<
    string | null
  >(null);
  const paperRef = useRef<HTMLDivElement>(null);

  const createQuizMutation = useCreateQuizApiV1QuizPost();

  const handlePrint = useReactToPrint({
    contentRef: paperRef,
    documentTitle: examName || "테스트 시험",
    pageStyle: printPageStyle,
  });

  const goTo = (nextScreen: Screen) => {
    setScreen(nextScreen);
  };

  const handleInviteSubmit = async () => {
    const trimmed = inviteCode.trim();
    if (!trimmed) return;

    setIsCheckingInvite(true);
    setInviteError(null);
    persistInviteCode(trimmed);

    try {
      const result = await checkInviteInviteGet();
      const isValid = Object.values(result).some(Boolean);

      if (!isValid) {
        throw new Error("invalid invite code");
      }

      setScreen("main");
    } catch {
      clearInviteCode();
      setInviteError("초대 코드가 올바르지 않습니다.");
    } finally {
      setIsCheckingInvite(false);
    }
  };

  const handleGenerate = () => {
    if (!examName.trim() || !problemFile) return;

    createQuizMutation.mutate(
      { data: { name: examName, file: problemFile } },
      {
        onSuccess: (quiz) => {
          setSelectedExamId(quiz.id);
          setGenerationState("generated");
          queryClient.invalidateQueries({
            queryKey: getListQuizzesApiV1QuizGetQueryKey(),
          });
        },
      }
    );
  };

  if (screen === "invite") {
    return (
      <InviteCodeScreen
        value={inviteCode}
        onChange={setInviteCode}
        onSubmit={handleInviteSubmit}
        isSubmitting={isCheckingInvite}
        errorMessage={inviteError}
      />
    );
  }

  if (screen === "main") {
    return <MainScreen onNavigate={goTo} />;
  }

  if (screen === "generate") {
    return (
      <AppShell activeScreen="generate" onNavigate={goTo}>
        {generationState === "generated" && selectedExamId ? (
          <GenerationComplete onViewPaper={() => setScreen("view")} />
        ) : (
          <ProblemGenerationPage
            examName={examName}
            file={problemFile}
            onExamNameChange={setExamName}
            onFileSelected={(file) => {
              setProblemFile(file);
              setGenerationState("filled");
            }}
            onGenerate={handleGenerate}
            isGenerating={createQuizMutation.isPending}
            errorMessage={
              createQuizMutation.isError
                ? "시험 생성에 실패했습니다. 다시 시도해주세요."
                : null
            }
          />
        )}
      </AppShell>
    );
  }

  if (screen === "view") {
    return (
      <AppShell activeScreen="view" onNavigate={goTo}>
        <ViewProblemPage
          selectedExamId={selectedExamId}
          onSelectExam={setSelectedExamId}
          onPrint={handlePrint}
          onGrade={() => {
            if (selectedExamId) {
              setSelectedGradingExamId(selectedExamId);
            }
            setScreen("grading");
          }}
          paperRef={paperRef}
        />
      </AppShell>
    );
  }

  return (
    <AppShell activeScreen="grading" onNavigate={goTo}>
      <OcrGradingPage
        selectedExamId={selectedGradingExamId}
        onSelectExam={setSelectedGradingExamId}
        file={gradingFile}
        onFileSelected={setGradingFile}
        onResetFile={() => setGradingFile(null)}
      />
    </AppShell>
  );
}

function InviteCodeScreen({
  value,
  onChange,
  onSubmit,
  isSubmitting,
  errorMessage,
}: {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
  errorMessage: string | null;
}) {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-50 p-2.5">
      <img
        src={heroBackground}
        alt=""
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-black/65 backdrop-blur-[3.3px]" />

      <form
        className="relative z-10 flex w-[368px] flex-col gap-5 overflow-hidden border border-slate-300 bg-white p-6"
        onSubmit={(event) => {
          event.preventDefault();
          onSubmit();
        }}
      >
        <div className="flex flex-col gap-1 text-slate-800">
          <h1 className="text-xl leading-7 font-medium">초대 코드 입력</h1>
          <p className="text-base leading-6">
            <strong className="font-semibold">LLQuiz</strong>를 사용하려면 초대
            코드를 입력하세요.
          </p>
        </div>
        <input
          className="h-10 w-full rounded bg-slate-100 px-2.5 text-sm leading-5 font-medium text-slate-800 outline-none placeholder:text-slate-500 focus:ring-2 focus:ring-blue-500"
          placeholder="초대 코드 입력"
          value={value}
          onChange={(event) => onChange(event.target.value)}
        />
        {errorMessage ? (
          <p className="text-sm leading-5 font-medium text-red-500">
            {errorMessage}
          </p>
        ) : null}
        <button
          className="h-9 w-full rounded-lg bg-blue-500 text-sm leading-5 font-medium text-white transition hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-55"
          type="submit"
          disabled={isSubmitting || !value.trim()}
        >
          {isSubmitting ? "확인 중..." : "입력"}
        </button>
      </form>
    </main>
  );
}

function MainScreen({ onNavigate }: { onNavigate: (screen: Screen) => void }) {
  const cards = [
    {
      title: "시험 생성",
      description: "파일을 기반으로 객관식 시험을 생성합니다.",
      image: generateCardImage,
      target: "generate" as const,
      imageClass: "h-[160px] w-[147px] object-cover object-center",
    },
    {
      title: "시험 조회",
      description: "만들어진 시험을 조회합니다.",
      image: viewCardImage,
      target: "view" as const,
      imageClass: "h-[160px] w-[154px] object-cover object-center",
    },
    {
      title: "자동 채점",
      description: "촬영된 시험지를 바탕으로 채점합니다.",
      image: gradingCardImage,
      target: "grading" as const,
      imageClass: "h-[160px] w-[181px] object-cover object-center",
    },
  ];

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-end overflow-hidden bg-slate-50 p-4">
      <img
        src={heroBackground}
        alt=""
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-black/65 backdrop-blur-[3.3px]" />
      <div className="absolute right-0 bottom-0 left-0 h-[442px] bg-slate-50/55 blur-[38.95px]" />
      <div className="absolute right-0 bottom-0 left-0 h-[311px] bg-slate-50" />

      <section className="relative z-10 flex w-full max-w-[1248px] flex-col items-center gap-8">
        <div className="flex flex-col items-center justify-center text-center text-white">
          <p className="font-brand text-[96px] leading-none">LLQuiz</p>
          <p className="text-2xl leading-8 font-medium">
            <strong className="font-bold">LLM</strong>으로 만드는 문제,{" "}
            <strong className="font-bold">OCR</strong>로 완성하는 채점
          </p>
        </div>

        <div className="grid w-full grid-cols-3 gap-4">
          {cards.map((card) => (
            <button
              key={card.title}
              className="flex h-[465px] min-w-0 flex-col items-center justify-center gap-[17px] overflow-hidden rounded-[35px] bg-slate-50 p-8 text-center shadow-[0_4px_32px_4px_rgba(0,0,0,0.08)] transition hover:-translate-y-1 hover:shadow-[0_10px_36px_8px_rgba(15,23,42,0.14)]"
              type="button"
              onClick={() => onNavigate(card.target)}
            >
              <img src={card.image} alt="" className={card.imageClass} />
              <span className="flex flex-col items-center gap-2 font-semibold whitespace-nowrap">
                <span className="text-4xl leading-10 text-slate-800">
                  {card.title}
                </span>
                <span className="text-xl leading-7 text-slate-500">
                  {card.description}
                </span>
              </span>
            </button>
          ))}
        </div>
      </section>
    </main>
  );
}

function AppShell({
  activeScreen,
  onNavigate,
  children,
}: {
  activeScreen: "generate" | "view" | "grading";
  onNavigate: (screen: Screen) => void;
  children: ReactNode;
}) {
  return (
    <main className="flex h-screen items-stretch overflow-hidden bg-slate-50 text-slate-800">
      <Sidebar activeScreen={activeScreen} onNavigate={onNavigate} />
      <section className="flex min-h-0 min-w-0 flex-1 items-stretch p-4">
        {children}
      </section>
    </main>
  );
}

function Sidebar({
  activeScreen,
  onNavigate,
}: {
  activeScreen: "generate" | "view" | "grading";
  onNavigate: (screen: Screen) => void;
}) {
  const items = [
    {
      screen: "generate" as const,
      label: "시험 생성",
      icon: "mdi:file-plus-outline" as const,
    },
    {
      screen: "view" as const,
      label: "시험 조회",
      icon: "material-symbols:search-rounded" as const,
    },
    {
      screen: "grading" as const,
      label: "자동 채점",
      icon: "material-symbols:scan-outline" as const,
    },
  ];

  return (
    <aside className="flex h-screen w-80 shrink-0 flex-col overflow-hidden border-r border-slate-200 bg-white">
      <div className="flex h-14 items-center border-b border-slate-200 py-4 pr-4 pl-3.5">
        <button
          type="button"
          className="flex items-end justify-center gap-[7px] overflow-hidden"
          onClick={() => onNavigate("main")}
        >
          <Icon
            name="tdesign:ai-edit-filled"
            size={24}
            className="text-slate-800"
          />
          <span className="font-brand flex h-6 w-[77px] flex-col justify-end text-[28px] leading-[0.61] text-slate-800">
            LLQuiz
          </span>
        </button>
      </div>
      <nav className="flex min-h-0 flex-1 flex-col gap-1 overflow-hidden p-3">
        {items.map((item) => {
          const isActive = item.screen === activeScreen;
          return (
            <button
              key={item.screen}
              type="button"
              className={`flex h-11 w-full items-center gap-3 overflow-hidden rounded-[10px] p-3 text-sm leading-5 ${
                isActive
                  ? "bg-slate-50 font-bold text-slate-800"
                  : "font-semibold text-slate-500 hover:bg-slate-50"
              }`}
              onClick={() => onNavigate(item.screen)}
            >
              <Icon name={item.icon} size={16} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
}

function ProblemGenerationPage({
  examName,
  file,
  onExamNameChange,
  onFileSelected,
  onGenerate,
  isGenerating,
  errorMessage,
}: {
  examName: string;
  file: File | null;
  onExamNameChange: (value: string) => void;
  onFileSelected: (file: File) => void;
  onGenerate: () => void;
  isGenerating: boolean;
  errorMessage: string | null;
}) {
  return (
    <section className="flex h-full min-w-0 flex-1 flex-col gap-4 overflow-hidden rounded-md border border-slate-200 bg-white p-3.5">
      <PageTitle>시험 생성</PageTitle>
      <div className="flex min-h-0 flex-1 flex-col gap-6">
        <FieldGroup title="시험 이름">
          <input
            className="h-10 w-full rounded bg-slate-100 px-2.5 text-sm leading-5 font-medium text-slate-800 outline-none placeholder:text-slate-500 focus:ring-2 focus:ring-blue-500"
            placeholder="시험 이름 입력"
            value={examName}
            onChange={(event) => onExamNameChange(event.target.value)}
          />
        </FieldGroup>

        <FieldGroup title="문제 개수">
          <div className="flex h-12 w-full cursor-not-allowed items-center gap-2.5 rounded-md border border-slate-200 p-3 text-sm leading-5 font-semibold text-black">
            <span className="min-w-0 flex-1">10개</span>
            <Icon
              name="material-symbols:arrow-drop-down-rounded"
              size={24}
              className="text-slate-700"
            />
          </div>
        </FieldGroup>

        <FileDropzone
          accept=".pdf,.doc,.docx,.txt,.hwp,.hwpx"
          file={file}
          kind="document"
          labelTop="드래그 또는 클릭해서"
          labelBottom="문서 업로드"
          onFileSelected={onFileSelected}
        />
      </div>

      {errorMessage ? (
        <p className="text-sm leading-5 font-medium text-red-500">
          {errorMessage}
        </p>
      ) : null}

      <PrimaryActionButton
        onClick={onGenerate}
        disabled={!examName.trim() || !file || isGenerating}
      >
        <Icon name="ix:ai" size={16} />
        {isGenerating ? "생성 중..." : "시험 생성하기"}
      </PrimaryActionButton>
    </section>
  );
}

function GenerationComplete({ onViewPaper }: { onViewPaper: () => void }) {
  return (
    <section className="flex h-full min-w-0 flex-1 flex-col gap-4 overflow-hidden rounded-md border border-slate-200 bg-white p-3.5">
      <PageTitle>시험 생성</PageTitle>
      <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-2.5">
        <Icon
          name="material-symbols:check-circle-rounded"
          size={96}
          className="text-blue-500"
        />
        <p className="text-2xl leading-8 font-semibold text-slate-800">
          시험이 생성되었습니다!
        </p>
        <p className="text-xl leading-7 font-medium text-slate-500">
          페이지를 이동하여 생성된 시험을 확인하고 출력할 수 있습니다.
        </p>
      </div>
      <button
        type="button"
        className="h-9 w-full rounded-lg bg-blue-500 text-sm leading-5 font-semibold text-white transition hover:bg-blue-600"
        onClick={onViewPaper}
      >
        시험지 보러가기
      </button>
    </section>
  );
}

function ViewProblemPage({
  selectedExamId,
  onSelectExam,
  onPrint,
  onGrade,
  paperRef,
}: {
  selectedExamId: string | null;
  onSelectExam: (examId: string) => void;
  onPrint: () => void;
  onGrade: () => void;
  paperRef: RefObject<HTMLDivElement | null>;
}) {
  const quizQuery = useGetQuizApiV1QuizQuizIdGet(selectedExamId ?? "", {
    query: { enabled: Boolean(selectedExamId) },
  });

  return (
    <div className="flex h-full min-w-0 flex-1 gap-4">
      <ExamListPanel
        title="시험 조회"
        selectedExamId={selectedExamId}
        onSelectExam={onSelectExam}
      />

      {selectedExamId ? (
        <TestPaper
          paperRef={paperRef}
          title={quizQuery.data?.name ?? ""}
          problems={quizQuery.data?.problems ?? []}
          isLoading={quizQuery.isLoading}
          isError={quizQuery.isError}
          onPrint={onPrint}
          onGrade={onGrade}
        />
      ) : null}
    </div>
  );
}

function OcrGradingPage({
  selectedExamId,
  onSelectExam,
  file,
  onFileSelected,
  onResetFile,
}: {
  selectedExamId: string | null;
  onSelectExam: (examId: string) => void;
  file: File | null;
  onFileSelected: (file: File) => void;
  onResetFile: () => void;
}) {
  const queryClient = useQueryClient();
  const gradesQuery = useListGradesApiV1GradeQuizIdGet(selectedExamId ?? "", {
    query: { enabled: Boolean(selectedExamId) },
  });
  const gradeMutation = useGradeQuizApiV1GradeQuizIdPost();

  const handleGrade = () => {
    if (!selectedExamId || !file) return;

    gradeMutation.mutate(
      { quizId: selectedExamId, data: { file } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({
            queryKey: getListGradesApiV1GradeQuizIdGetQueryKey(selectedExamId),
          });
        },
      }
    );
  };

  const handleGradeAgain = () => {
    gradeMutation.reset();
    onResetFile();
  };

  const handleSelectExam = (examId: string) => {
    if (examId !== selectedExamId) {
      gradeMutation.reset();
      onResetFile();
    }
    onSelectExam(examId);
  };

  return (
    <div className="flex h-full min-w-0 flex-1 gap-4">
      <ExamListPanel
        title="자동 채점"
        selectedExamId={selectedExamId}
        onSelectExam={handleSelectExam}
      />
      {selectedExamId && gradeMutation.isSuccess && gradeMutation.data ? (
        <GradedResultPage
          result={gradeMutation.data}
          onGradeAgain={handleGradeAgain}
        />
      ) : selectedExamId ? (
        <section className="flex min-w-0 flex-1 flex-col gap-4 overflow-hidden rounded-md border border-slate-200 bg-white p-3.5">
          <PageTitle>자동 채점</PageTitle>
          <div className="flex min-h-0 flex-1 flex-col gap-6">
            <FieldGroup title="성적">
              <div className="flex w-full flex-col gap-2.5 rounded-lg border border-slate-200 bg-white p-3">
                <div className="grid grid-cols-3 gap-1 rounded-lg bg-slate-50 p-2 text-xs leading-4 font-semibold text-slate-500">
                  <span>순위</span>
                  <span>이름</span>
                  <span>성적</span>
                </div>
                {gradesQuery.isLoading ? (
                  <p className="p-2 text-xs leading-4 text-slate-500">
                    불러오는 중...
                  </p>
                ) : gradesQuery.isError ? (
                  <p className="p-2 text-xs leading-4 text-red-500">
                    성적을 불러오지 못했습니다.
                  </p>
                ) : gradesQuery.data && gradesQuery.data.length > 0 ? (
                  gradesQuery.data.map((grade) => (
                    <div
                      key={`${grade.rank}-${grade.name}-${grade.createdAt}`}
                      className="grid grid-cols-3 gap-1 rounded-lg border border-slate-100 bg-white px-2 py-3.5 text-xs leading-4 font-medium text-slate-900"
                    >
                      <span>{grade.rank}</span>
                      <span>{grade.name}</span>
                      <span>
                        {grade.score}/{grade.total}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="p-2 text-xs leading-4 text-slate-500">
                    아직 채점된 결과가 없습니다.
                  </p>
                )}
              </div>
            </FieldGroup>

            <FileDropzone
              accept="*"
              file={file}
              kind="image"
              labelTop="드래그 또는 클릭해서"
              labelBottom="파일 업로드"
              onFileSelected={onFileSelected}
            />
          </div>
          {gradeMutation.isError ? (
            <p className="text-sm leading-5 font-medium text-red-500">
              채점에 실패했습니다. 다시 시도해주세요.
            </p>
          ) : null}
          <PrimaryActionButton
            onClick={handleGrade}
            disabled={!file || gradeMutation.isPending}
          >
            <Icon name="ix:ai" size={16} />
            {gradeMutation.isPending ? "채점 중..." : "채점하기"}
          </PrimaryActionButton>
        </section>
      ) : null}
    </div>
  );
}

function GradedResultPage({
  result,
  onGradeAgain,
}: {
  result: GradeResponse;
  onGradeAgain: () => void;
}) {
  return (
    <section className="flex min-w-0 flex-1 flex-col gap-4 overflow-hidden rounded-md border border-slate-200 bg-white p-3.5">
      <PageTitle>자동 채점</PageTitle>
      <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-4">
        <p className="text-2xl leading-8 font-semibold text-slate-800">
          채점 결과
        </p>
        <p className="text-6xl leading-none font-bold text-slate-900">
          {result.score}/{result.total}
        </p>
        <div className="flex flex-col gap-2 pt-2 text-base leading-6 text-slate-800">
          <div className="flex items-center gap-6">
            <span className="w-12 shrink-0 font-semibold">이름:</span>
            <span>{result.name}</span>
          </div>
          <div className="flex items-center gap-6">
            <span className="w-12 shrink-0 font-semibold">결과:</span>
            <div className="flex items-center gap-2">
              {result.result.map((item) => (
                <Icon
                  key={item.number}
                  name={
                    item.correct
                      ? "material-symbols:check-circle"
                      : "material-symbols:cancel"
                  }
                  size={24}
                  className={item.correct ? "text-green-500" : "text-red-500"}
                />
              ))}
            </div>
          </div>
          <div className="flex items-center gap-6">
            <span className="w-12 shrink-0 font-semibold">선택:</span>
            <div className="flex items-center gap-2">
              {result.result.map((item) => (
                <span key={item.number} className="flex w-6 justify-center">
                  {item.selectedIndex !== null ? item.selectedIndex + 1 : "-"}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
      <button
        type="button"
        className="h-9 w-full rounded-lg bg-blue-500 text-sm leading-5 font-semibold text-white transition hover:bg-blue-600"
        onClick={onGradeAgain}
      >
        더 채점하기
      </button>
    </section>
  );
}

function ExamListPanel({
  title,
  selectedExamId,
  onSelectExam,
}: {
  title: string;
  selectedExamId: string | null;
  onSelectExam: (examId: string) => void;
}) {
  const quizzesQuery = useListQuizzesApiV1QuizGet();
  const exams = quizzesQuery.data ?? [];

  return (
    <aside className="flex h-full w-[263px] shrink-0 flex-col gap-4 overflow-hidden rounded-md border border-slate-200 bg-white p-3.5">
      <PageTitle>{title}</PageTitle>
      <div className="flex flex-col gap-2.5 overflow-y-auto">
        {quizzesQuery.isLoading ? (
          <p className="text-sm leading-5 text-slate-500">불러오는 중...</p>
        ) : quizzesQuery.isError ? (
          <p className="text-sm leading-5 text-red-500">
            시험 목록을 불러오지 못했습니다.
          </p>
        ) : exams.length === 0 ? (
          <p className="text-sm leading-5 text-slate-500">
            생성된 시험이 없습니다.
          </p>
        ) : (
          exams.map((exam) => {
            const isSelected = exam.id === selectedExamId;
            return (
              <button
                key={exam.id}
                type="button"
                className="flex h-[60px] w-full items-center gap-2.5 overflow-hidden rounded-lg border border-slate-100 bg-white px-3 py-2 text-left transition hover:border-slate-200 hover:bg-slate-50"
                onClick={() => onSelectExam(exam.id)}
              >
                <span className="flex min-w-0 flex-1 flex-col justify-center overflow-hidden">
                  <span className="truncate text-base leading-6 font-semibold text-slate-800">
                    {exam.name}
                  </span>
                  <span className="text-sm leading-5 text-slate-500">
                    {exam.count}문제
                  </span>
                </span>
                {isSelected ? (
                  <Icon
                    name="material-symbols:check-circle"
                    size={20}
                    className="shrink-0 text-blue-500"
                  />
                ) : null}
              </button>
            );
          })
        )}
      </div>
    </aside>
  );
}

function TestPaper({
  title,
  problems,
  isLoading,
  isError,
  onPrint,
  onGrade,
  paperRef,
}: {
  title: string;
  problems: ProblemPublic[];
  isLoading: boolean;
  isError: boolean;
  onPrint: () => void;
  onGrade: () => void;
  paperRef: RefObject<HTMLDivElement | null>;
}) {
  const half = Math.ceil(problems.length / 2);
  const columns = [problems.slice(0, half), problems.slice(half)];

  return (
    <section
      ref={paperRef}
      className="test-paper relative flex h-full min-w-0 flex-1 flex-col overflow-hidden rounded-md border border-slate-200 bg-white"
    >
      <header className="flex h-[106px] shrink-0 flex-col items-start gap-2.5 py-5 text-center text-slate-800">
        <h2 className="w-full text-2xl leading-8 font-bold">{title}</h2>
        <div className="flex h-6 w-full items-center justify-center gap-7 overflow-hidden px-2.5 text-base leading-6 whitespace-nowrap">
          <span>성 명 : _______________________</span>
          <span>점 수 : _______________________</span>
        </div>
      </header>
      <div className="relative flex min-h-0 flex-1 items-start overflow-hidden border-t border-slate-800 pb-5">
        {isLoading ? (
          <p className="w-full p-4 text-center text-sm text-slate-500">
            불러오는 중...
          </p>
        ) : isError ? (
          <p className="w-full p-4 text-center text-sm text-red-500">
            시험지를 불러오지 못했습니다.
          </p>
        ) : (
          columns.map((column, columnIndex) => (
            <div
              key={columnIndex}
              className={`flex h-full min-w-0 flex-1 flex-col gap-6 overflow-hidden p-3 ${
                columnIndex === 0 ? "border-r border-slate-800" : ""
              }`}
            >
              {column.map((problem, problemIndex) => (
                <QuestionBlock
                  key={problem.question}
                  index={columnIndex * half + problemIndex + 1}
                  problem={problem}
                />
              ))}
            </div>
          ))
        )}

        <div className="paper-actions absolute bottom-4 left-0 flex w-full items-center justify-center gap-6 overflow-hidden p-2.5">
          <PaperActionButton
            icon="material-symbols:print-outline"
            label="인쇄"
            onClick={onPrint}
          />
          <PaperActionButton
            icon="material-symbols:scan-outline"
            label="채점"
            onClick={onGrade}
          />
        </div>
      </div>
    </section>
  );
}

function QuestionBlock({
  index,
  problem,
}: {
  index: number;
  problem: ProblemPublic;
}) {
  return (
    <div className="flex h-[100px] w-full shrink-0 flex-col items-start gap-2 overflow-hidden">
      <p className="w-full truncate text-xs leading-4 font-medium text-slate-800">
        {index}. {problem.question}
      </p>
      <div className="flex w-full flex-col justify-center gap-1">
        {problem.choices.map((choice) => (
          <div
            key={choice}
            className="grid h-4 w-full grid-cols-[16px_minmax(0,1fr)] items-center gap-1"
          >
            <Icon
              name="lsicon:checkbox-filled"
              size={16}
              className="h-4 w-4 shrink-0 text-slate-800"
            />
            <span className="truncate text-xs leading-4 text-slate-800">
              {choice}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function FileDropzone({
  accept,
  file,
  kind,
  labelTop,
  labelBottom,
  onFileSelected,
}: {
  accept: string;
  file: File | null;
  kind: "document" | "image";
  labelTop: string;
  labelBottom: string;
  onFileSelected: (file: File) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const selectFile = (nextFile: File | undefined) => {
    if (nextFile) {
      onFileSelected(nextFile);
    }
  };

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    selectFile(event.target.files?.[0]);
  };

  const handleDrop = (event: DragEvent<HTMLButtonElement>) => {
    event.preventDefault();
    setIsDragging(false);
    selectFile(event.dataTransfer.files?.[0]);
  };

  return (
    <button
      type="button"
      className={`flex min-h-[256px] flex-1 flex-col items-center justify-center gap-1 overflow-hidden rounded-[11px] border-4 border-dashed p-2.5 transition ${
        isDragging ? "border-blue-400 bg-blue-50" : "border-slate-300 bg-white"
      }`}
      onClick={() => inputRef.current?.click()}
      onDragEnter={() => setIsDragging(true)}
      onDragLeave={() => setIsDragging(false)}
      onDragOver={(event) => event.preventDefault()}
      onDrop={handleDrop}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={handleInputChange}
      />
      {file ? (
        <>
          <Icon name="mdi:file-outline" size={24} className="text-slate-700" />
          <span className="text-xl leading-7 font-semibold text-slate-700">
            {file.name} ({formatFileSize(file.size)})
          </span>
        </>
      ) : (
        <>
          <Icon
            name="material-symbols:upload"
            size={40}
            className="text-slate-500"
          />
          <span className="text-center text-xl leading-7 font-semibold text-slate-500">
            <span className="block">{labelTop}</span>
            <span className="block">{labelBottom}</span>
          </span>
        </>
      )}
      <span className="sr-only">
        {kind === "document" ? "문서 파일 선택" : "이미지 파일 선택"}
      </span>
    </button>
  );
}

function FieldGroup({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="flex w-full shrink-0 flex-col gap-1.5">
      <div className="flex w-full items-center gap-2.5">
        <p className="shrink-0 text-sm leading-5 font-medium text-slate-600">
          {title}
        </p>
        <div className="h-px min-w-0 flex-1 bg-slate-500" />
      </div>
      {children}
    </div>
  );
}

function PageTitle({ children }: { children: ReactNode }) {
  return (
    <h1 className="flex shrink-0 flex-col justify-center text-sm leading-5 font-medium whitespace-nowrap text-slate-600">
      {children}
    </h1>
  );
}

function PrimaryActionButton({
  children,
  disabled,
  onClick,
}: {
  children: ReactNode;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className="relative flex h-10 w-full shrink-0 items-center justify-center gap-1 overflow-hidden rounded-lg bg-slate-900 p-2.5 text-sm leading-5 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-55"
      disabled={disabled}
      onClick={onClick}
    >
      <span className="absolute top-[-54px] right-[-27px] size-32 rounded-xl bg-blue-600 opacity-30 blur-[32px]" />
      <span className="relative flex items-center gap-1">{children}</span>
    </button>
  );
}

function PaperActionButton({
  icon,
  label,
  onClick,
}: {
  icon: "material-symbols:print-outline" | "material-symbols:scan-outline";
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className="flex size-16 shrink-0 flex-col items-center justify-center gap-[3px] overflow-hidden rounded-[15px] border border-slate-300 bg-white p-2.5 shadow-[0_10px_24px_rgba(15,23,42,0.16),0_2px_6px_rgba(15,23,42,0.08)] transition hover:bg-slate-50 hover:shadow-[0_12px_28px_rgba(15,23,42,0.18),0_3px_8px_rgba(15,23,42,0.1)]"
      onClick={onClick}
    >
      <Icon name={icon} size={24} className="text-slate-800" />
      <span className="text-xs leading-4 font-semibold whitespace-nowrap text-slate-800">
        {label}
      </span>
    </button>
  );
}

export default App;
