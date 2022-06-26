import CodeEditor from "./CodeEditor";

export default function AssetProperties({ filename }) {
  
  return (
    <div>
      <CodeEditor filename={"/properties/"+filename+".json"} />
    </div>
  );
}