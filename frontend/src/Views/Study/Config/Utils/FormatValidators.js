const trimString = (str) => {
  return str.replace(/^\s\s*/, '').replace(/\s\s*$/, '');
};

export function validateManifestName(manifestName, manifestList) {
  if (!manifestName) {
    return {
      valid: false,
      err: `Please input attribute template name`,
    };
  }
  let manifestNameTrim = trimString(manifestName);
  const specialChars = ['\\', '/', ':', '?', '*', '<', '>', '|', '"', "'"];
  if (manifestNameTrim.length === 0 || manifestNameTrim.length > 32) {
    return {
      valid: false,
      err: 'Attribute template name must be between 1 and 32 characters',
    };
  }
  for (let char of specialChars) {
    if (manifestNameTrim.indexOf(char) !== -1) {
      return {
        valid: false,
        err: "Attribute template name can not contain any of the following characters \\ / : ? * < > | \" '"
      };
    }
  }
  const duplicate = manifestList.find((v) => v.name === manifestNameTrim);
  if (duplicate) {
    return {
      valid: false,
      err: 'An attribute template with this name already exists in this project'
    };
  }
  return {
    valid: true,
    err: null,
  };
}

export function validateAttributeName(attributeName, otherAttrs) {
  if (!attributeName) {
    return {
      valid: false,
      err: 'Please input attribute name'
    };
  }

  let attributeNameTrim = trimString(attributeName);
  if (!attributeNameTrim) {
    return {
      valid: false,
      err: 'Please input attribute name'
    };
  }

  if (attributeNameTrim.length === 0 || attributeNameTrim.length > 32) {
    return {
      valid: false,
      err: 'Attribute name must be between 1 and 32 characters'
    };
  }

  if (!/^[A-Za-z0-9 ]+$/i.test(attributeNameTrim)) {
    return {
      valid: false,
      err: 'Only letters, numbers and space is allowed for attribute name',
    };
  }

  const existentAttr = otherAttrs.find((x) => x.name === attributeNameTrim);
  if (existentAttr) {
    return {
      valid: false,
      err: 'This name has already been defined in attribute template',
    };
  }

  return {
    valid: true,
    err: null,
  };
}

export function validateAttrValue(attributeVal) {
  if (!attributeVal) {
    return {
      valid: false,
      err: 'Value must be between 1 and 32 characters',
    };
  }
  let attributeValTrim = trimString(attributeVal);
  if (attributeValTrim.length === 0 || attributeValTrim.length > 250) {
    return {
      valid: false,
      err: 'Value must be between 1 and 250 characters',
    };
  }
  // if (!/^[A-Za-z0-9_!%&/()=?*+#.;-]+$/i.test(attributeValTrim)) {
  //   return {
  //     valid: false,
  //     err: "Value may only contain letters, numbers, and/or special characters in ( -_!%&/()=?*+#.;)",
  //   };
  // }
  return {
    valid: true,
    err: null,
  };
}
