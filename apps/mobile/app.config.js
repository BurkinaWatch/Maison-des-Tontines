module.exports = ({ config }) => {
  const isPreviewBuild = process.env.EAS_BUILD_PROFILE === "preview";

  return {
    ...config,
    updates: {
      ...config.updates,
      ...(isPreviewBuild ? { checkAutomatically: "NEVER" } : {}),
    },
  };
};
