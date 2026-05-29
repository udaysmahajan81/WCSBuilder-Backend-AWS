import {
  readJson
}
from "../storage/jsonDB.js";

export async function getUserFeatures(
  req,
  res
) {

  try {

    const features =
      await readJson(
        "systemfeatures.json",
        {
          Menu: []
        }
      );

    const result = [];

    features.Menu.forEach(menu => {

      result.push({

        FeatureName:
          menu.Name,

        DisplayName:
          menu.DisplayName,

        FeatureType:
          menu.Type,

        Icon:
          menu.Icon || null
      });

      (menu.Children || [])

        .forEach(child => {

          result.push({

            FeatureName:
              child.Name,

            DisplayName:
              child.DisplayName,

            FeatureType:
              child.Type,

            SvgPath:
              child.SvgPath || null
          });
        });
    });

    res.json(result);

  } catch (err) {

    console.error(err);

    res.status(500).json({

      error:
        "Failed to load features"
    });
  }
}