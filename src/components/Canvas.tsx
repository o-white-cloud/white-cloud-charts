interface CanvasProps {}

const Canvas: React.FunctionComponent<React.PropsWithChildren<CanvasProps>> = (props) => {
  return (
    <div className="bg-gray-300">
      {props.children}
    </div>
  );
};

export default Canvas;