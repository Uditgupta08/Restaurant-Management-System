const client = require("../db");

const createFunctionQuery = `
CREATE OR REPLACE FUNCTION no_special_char(name VARCHAR)
RETURNS BOOLEAN AS 
$$
BEGIN
  IF name ~* '[^a-zA-Z0-9 ]' THEN
    RETURN FALSE;
  ELSE
    RETURN TRUE;
  END IF;
END;
$$
LANGUAGE plpgsql;
`;

client
  .query(createFunctionQuery)
  .then(() => console.log("Function created successfully"))
  .catch((err) => console.error("Error creating function:", err));
