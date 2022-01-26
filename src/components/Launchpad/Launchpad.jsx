import { useState } from "react";
import { Button, Skeleton } from "antd";
import NewProjectModal from "./NewProjectModal";
import { useMoralisQuery } from "react-moralis";
import Project from "./Project";


const Launchpad = function () {
  const [isCreateNewProjectModalActive, setCreateNewProjectModalActive] = useState(false);
  const { data } = useMoralisQuery(
    "Launchprojects",
    query => query.descending("created"),
    [],
    {
      live: true,
    },
  );

  const styles = {
    Projects: {
      display: "flex",
      flexWrap: "wrap",
      WebkitBoxPack: "start",
      justifyContent: "center",
      margin: "0 auto",
      //maxWidth: "1000px",
      //width: "100%",
      gap: "10px",
      //backgroundColor: "red"
    },
  };

  return (
    <div style={{display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "20px", width: "100%"}}>
      <div style={{width: "200px"}}>
        <Button onClick={() =>{setCreateNewProjectModalActive(true)}} style={{color: "orange", backgroundColor: "blue", borderRadius: "15px", border: "0px"}}>+ Create new project</Button>
      </div>
      <div style={styles.Projects}>
        <Skeleton loading={!data}>
          {data &&
            data.map((project, index) => {
                return (
                  <Project project={project} index={index} key={project.id} />
                );
              }
            )}
        </Skeleton>
      </div>    
      {isCreateNewProjectModalActive && (
        <NewProjectModal
          open={isCreateNewProjectModalActive}
          onClose={() => setCreateNewProjectModalActive(false)}
        />
      )}
    </div>
    );
};

export default Launchpad;
