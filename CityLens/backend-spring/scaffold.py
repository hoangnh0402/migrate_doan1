import os

base_dir = r"c:\Users\hoang.nguyenhuy3\migrate_doan1\CityLens\backend-spring"

root_pom = """<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
  <modelVersion>4.0.0</modelVersion>
  <parent>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-parent</artifactId>
    <version>3.4.3</version>
    <relativePath/>
  </parent>
  <groupId>com.citylens</groupId>
  <artifactId>backend-spring</artifactId>
  <version>1.0.0-SNAPSHOT</version>
  <packaging>pom</packaging>
  <name>backend-spring</name>

  <properties>
    <java.version>17</java.version>
  </properties>

  <modules>
    <module>common</module>
    <module>infrastructure</module>
    <module>user-domain</module>
    <module>report-domain</module>
    <module>device-domain</module>
    <module>map-domain</module>
    <module>notification-domain</module>
    <module>media-domain</module>
    <module>assignment-domain</module>
    <module>application</module>
  </modules>

</project>
"""
with open(os.path.join(base_dir, "pom.xml"), "w") as f:
    f.write(root_pom)

domain_structure = [
    "domain/model", "domain/service", "domain/event", "domain/exception",
    "application/command/port/in", "application/command/port/out", "application/command/service", "application/command/dto",
    "application/query/port/in", "application/query/port/out", "application/query/service", "application/query/dto",
    "adapter/in/web", "adapter/out/persistence/entity", "adapter/out/persistence/repository", 
    "adapter/out/readmodel/redis", "adapter/out/readmodel/postgres", "adapter/out/cache",
    "adapter/out/messaging/publisher", "adapter/out/messaging/consumer",
    "mapper", "config"
]

modules = {
    "common": [
        "config", "exception", "response", "event", "util", "constant", "annotation"
    ],
    "infrastructure": [
        "config", "persistence/base", "cache/redis", "messaging/rabbit/config", 
        "messaging/rabbit/publisher", "messaging/rabbit/consumer", "messaging/outbox", "security"
    ],
    "user-domain": domain_structure,
    "report-domain": domain_structure,
    "device-domain": domain_structure,
    "map-domain": domain_structure,
    "notification-domain": domain_structure,
    "media-domain": domain_structure,
    "assignment-domain": domain_structure,
    "application": [
        "config", "bootstrap"
    ]
}

def generate_module_pom(module_name):
    return f"""<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
  <modelVersion>4.0.0</modelVersion>
  <parent>
    <groupId>com.citylens</groupId>
    <artifactId>backend-spring</artifactId>
    <version>1.0.0-SNAPSHOT</version>
  </parent>
  <artifactId>{module_name}</artifactId>
  
  <dependencies>
      <!-- Add dependencies as needed per module -->
  </dependencies>
</project>
"""

for mod, paths in modules.items():
    mod_dir = os.path.join(base_dir, mod)
    os.makedirs(mod_dir, exist_ok=True)
    
    with open(os.path.join(mod_dir, "pom.xml"), "w") as f:
        f.write(generate_module_pom(mod))
        
    pkg_base = os.path.join(mod_dir, "src", "main", "java", "com", "citylens", mod.replace("-domain", ""))
    
    for p in paths:
        target = os.path.join(pkg_base, p.replace("/", os.sep))
        os.makedirs(target, exist_ok=True)

print("Scaffolding complete with all modules!")
