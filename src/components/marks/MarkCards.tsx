import { useState } from "react";
import { CategoryScale } from "chart.js";
import Chart from "chart.js/auto";
import LineChart from "./graph";
import { useTheme } from "next-themes";
import { IoInformationCircleSharp } from "react-icons/io5";

Chart.register(CategoryScale);

interface MarkCardProps {
  "Course Code": string;
  "Course Type": string;
  "Test Performance": Record<string, number[]> | string;
}

interface CardProps {
  data: MarkCardProps[];
  arr: { [key: string]: string };
}

function MarkCards({ data, arr }: CardProps) {
  const { resolvedTheme } = useTheme();
  const [expandedCardIndex, setExpandedCardIndex] = useState<number | null>(
    null
  );

  const toggleCardExpansion = (index: number) => {
    setExpandedCardIndex((prevIndex) => (prevIndex === index ? null : index));
  };

  const generateChartData = (testPerformance: Record<string, number[]>) => {
    const labels = Object.keys(testPerformance);
    const scores = Object.values(testPerformance).map(
      (score) => (score[1] / score[0]) * 100
    );

    return {
      labels: labels,
      datasets: [
        {
          label: "Performance Scores",
          data: scores,
          backgroundColor: [
            "rgba(75,192,192,1)",
            "#ecf0f1",
            "#50AF95",
            "#f3ba2f",
            "#2a71d0",
          ],
          borderColor: resolvedTheme === "dark" ? "#49DE80" : "black",
          borderWidth: 2,
        },
      ],
    };
  };

  return (
    <div className="flex flex-col mx-auto h-fit w-screen lg:w-[73vw] mt-[2vh] mb-[7vh]">
      <div className="text-2xl font-bold my-3 mx-5">Performance</div>
      <div className="flex flex-row flex-wrap justify-between w-full h-fit">
        {data.length > 0 ? (
          data.map((mark, index) => {
            const totalScore =
              typeof mark["Test Performance"] === "object"
                ? Object.values(mark["Test Performance"]).reduce(
                    (sum, scores) => sum + scores[1],
                    0
                  )
                : 0;
            const max =
              typeof mark["Test Performance"] === "object"
                ? Object.values(mark["Test Performance"]).reduce(
                    (sum, scores) => sum + scores[0],
                    0
                  )
                : 0;

            const chartData =
              typeof mark["Test Performance"] === "object"
                ? generateChartData(mark["Test Performance"])
                : null;

            return (
              <div
                className="flex flex-col mx-auto w-[340px] h-auto border-2 border-dashed font-bold dark:bg-black rounded-[20px] p-3 my-2 cursor-pointer"
                key={index}
              >
                <p className="text-md md:text-lg my-3">
                  {arr[mark["Course Code"]]}
                </p>
                {Object.keys(mark["Test Performance"]).length > 0 ? (
                  <div className="grid grid-cols-3 py-1 bg-[#F3F4F6] text-base my-1 text-black dark:bg-[#171B26] dark:text-white dark:border-500 border-[1px] rounded-lg border-gray-400 font-semibold text-center bg-[#F3F4F6] dark:bg-[#171B26]">
                    <div>Component</div>
                    <div>Max</div>
                    <div>Scored</div>
                  </div>
                ) : (
                  ""
                )}

                <div>
                  {typeof mark["Test Performance"] === "object" &&
                  Object.keys(mark["Test Performance"]).length > 0 ? (
                    Object.entries(mark["Test Performance"]).map(
                      ([testName, scores], idx) => (
                        <div
                          className={`rounded-md grid grid-cols-3 mx-auto ${
                            idx % 2 === 0
                              ? "bg-[#F3F4F6] dark:bg-[#171B26]"
                              : ""
                          }`}
                          key={idx}
                        >
                          <div className="flex flex-row items-center justify-center font-semibold block">
                            {testName}
                          </div>
                          <div className="flex flex-row items-center justify-center font-semibold block">
                            {scores[0]}
                          </div>
                          <div
                            className={`flex flex-row items-center justify-center font-extrabold block ${
                              (scores[1] / scores[0]) * 100 > 50
                                ? "text-[#49DE80]"
                                : ""
                            }`}
                          >
                            {scores[1]}
                          </div>
                        </div>
                      )
                    )
                  ) : (
                    <div className="">No data available</div>
                  )}
                </div>

                {Object.keys(mark["Test Performance"]).length > 0 ? (
                  <div>
                    <div className="text-right font-bold mt-3">
                      <div className="flex flex-row justify-end px-2 items-center">
                        <p
                          onClick={() => toggleCardExpansion(index)}
                          className="flex flex-row flex-nowrap gap-1 dark:text-black bg-gray-200 dark:bg-white rounded-xl px-2 py-1 text-xs font-bold active:scale-95 duration-200 transition-all"
                        >
                          <span className="text-lg">
                            <IoInformationCircleSharp />
                          </span>
                          More info
                        </p>
                        <div className="flex flex-row justify-center items-center px-2 h-fit bg-gray-200 text-black dark:bg-white rounded-l-2xl text-base md:text-md font-bold w-fit gap-[5px] ml-auto">
                          <span className="rounded-[100px] bg-black text-white text-xs px-[5px]">
                            total
                          </span>
                          {max}
                        </div>
                        <div className="flex flex-row justify-center items-center px-2 h-fit bg-green-200 dark:bg-[#1B3C1E] text-base md:text-md rounded-r-2xl text-green-500 dark:text-[#49DE80] font-bold w-fit gap-[5px]">
                          {totalScore.toFixed(2)}
                        </div>
                      </div>
                      <div className="flex flex-row items-center justify-center w-full mt-4"></div>
                    </div>

                    <div
                      className="mt-3 transition-all duration-500 ease-in-out max-h-[1000px] overflow-hidden"
                      style={{
                        maxHeight: expandedCardIndex === index ? "1000px" : "0",
                      }}
                    >
                      {chartData ? <LineChart chartData={chartData} /> : null}
                    </div>
                  </div>
                ) : (
                  ""
                )}
              </div>
            );
          })
        ) : (
          <div className="flex flex-row items-center justify-center h-[20vh] w-full border rounded-[20px] mx-5">
            <p className="text-lg font-bold">No Performance data available.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default MarkCards;
